var generateMazeGame = function () {

    var EDIT_MODE = 0, // 0-none, 1-runes only, 2-complete
        ARIADNE = false; // visual guidance thru map

    var RUNES = [null, 'J', 'a', null, 'A', 'b', 'c', null, 'd', 'e', 'f', null, 'g', null, 'h', 'i', null, 'j', null, 'k', 'K', 'l', 'm', 'M', 'n', null,
        "N", 'o', null, "q", 'Q', null, 'r', 'R', "s", null, "S", "t", null, "T", "u", null, "v", 'w', null, "y", "Y", "Z", null, null, "1", "2", "3", "4", "5", "6", "7", "0", "!"]

    var D_ROWS = 91,
        D_COLS = 127,
        VIEW_ROWS = 0,
        VIEW_COLS = 0,
        VP_LEFT = 0,
        VP_TOP = 0,
        D_CELL_SIZE = 32,
        C_BORDER = 1 / D_CELL_SIZE;

    var SYNC_READY = 0,
        SYNC_EVT = null;

    var AVATAR_X = ORIGINAL_X = parseInt($.cookie("AVATAR_X") || 105), // start coordinates
        AVATAR_Y = ORIGINAL_Y = parseInt($.cookie("AVATAR_Y") || 22),
        AVATAR_REACHED_END = parseInt($.cookie("AVATAR_REACHED_END") || 0),
        AVATAR_NAME = $.cookie("AVATAR_NAME"),
        AVATAR_MOVES = parseInt($.cookie("AVATAR_MOVES") || 0), // count of moves
        AVATAR_TIME = 0, // time since opening the page
        AVATAR_TIMER = null; // timer handler

    var AVATAR = {
        x: 120,
        y: 120,
        phase: 1, /// 1 == moving to left, 2 == moving to right
        blink: 0,
        angle: 0
    }


    var C_LINETO = 1,
        C_MOVETO = 2,
        C_CURVER = 3,
        C_TEXT = 4,
        C_RECT = 5;


    var COLORS = randomColor({ hue: 'purple', count: 10, format: 'rgba' });

    //CELLS[row,col]
    //only walkways, where & 1 means that the block has vertical top wall
    // and 2 bit means that the block has horisontal left wall
    var CELLS = Array.apply(0, Array(D_ROWS)).map(function (x, i) {
        return Array.apply(0, Array(D_COLS)).map(function (x, i) { return 3 })
    })

    // cells converted into a matrix, 
    // blocks is twice the CELLS array
    // every cell has information whether it is blocked/true(wall) or empty/false(walkway)
    var MAZE_BLOCKS = [];

    var LINES = { base: [], draw: [] }; // all movements (type,xmy)



    // hand draw movements ----------------------------------------- https://29a.ch/2010/2/10/hand-drawn-lines-algorithm-javascript-canvas-html5
    function fuzz(x, f) {
        return x + Math.random() * f - f / 2;
    }

    // estimate the movement of the arm
    // x0: start
    // x1: end
    // t: step from 0 to 1
    function handDrawMovement(x0, x1, t) {
        return x0 + (x0 - x1) * (
            15 * Math.pow(t, 4) -
            6 * Math.pow(t, 5) -
            10 * Math.pow(t, 3)
        )
    }

    function handDrawLine(ctx, x0, y0, x1, y1) {
        LINES.draw.push([C_MOVETO, x0, y0])

        var d = Math.sqrt((x1 - x0) * (x1 - x0) + (y1 - y0) * (y1 - y0))

        var steps = d / 25;
        if (steps < 4) {
            steps = 1;
        }

        // fuzzyness
        var f = 8.5;
        for (var i = 1; i <= steps; i++) {
            var t1 = i / steps;
            var t0 = t1 - 1 / steps
            var xt0 = handDrawMovement(x0, x1, t0)
            var yt0 = handDrawMovement(y0, y1, t0)
            var xt1 = handDrawMovement(x0, x1, t1)
            var yt1 = handDrawMovement(y0, y1, t1)

            LINES.draw.push([C_CURVER, fuzz(xt0, f), fuzz(yt0, f), xt1, yt1])
            LINES.draw.push([C_MOVETO, xt1, yt1])
            //ctx.quadraticCurveTo(fuzz(xt0, f), fuzz(yt0, f), xt1, yt1)
            //ctx.moveTo(xt1, yt1)
        }
    }
    // hand draw movements -----------------------------------------        

    var CANVAS = $('.maze'),
        CANVAS_DRAW = 0;


    if (CanvasRenderingContext2D.prototype.ellipse == undefined) {
        CanvasRenderingContext2D.prototype.ellipse = function (x, y, radiusX, radiusY, rotation, startAngle, endAngle, antiClockwise) {
            this.save();
            this.translate(x, y);
            this.rotate(rotation);
            this.scale(radiusX, radiusY);
            this.arc(0, 0, 1, startAngle, endAngle, antiClockwise);
            this.restore();
        }
    }

    var renderAvatar = function (ctx) {

        var AVT_SIZE = D_CELL_SIZE - 2;

        ctx.clearRect(x - D_CELL_SIZE, y - D_CELL_SIZE, D_CELL_SIZE * 2, D_CELL_SIZE * 2);

        var ANGLE = AVATAR.angle * Math.PI / 180;
        var BLINK_R = AVATAR.blink <= 200 ? Math.round(4 * Math.random()) + 2 : 2;
        var BLINK_L = AVATAR.blink <= 200 ? Math.round(4 * Math.random()) + 2 : 2;

        ctx.rotate(ANGLE)
        var y = AVATAR.y * Math.cos(ANGLE) + AVATAR.x * Math.sin(-ANGLE);
        var x = AVATAR.y * Math.sin(ANGLE) + AVATAR.x * Math.cos(- ANGLE);
        //console.log(ANGLE, AVATAR.angle, Math.round(x),  AVATAR.x, Math.round(y), AVATAR.y)

        // body
        //ctx.beginPath();
        //ctx.fillStyle = '#3E8B8A'
        //ctx.arc(x, y, (AVT_SIZE-5)/2, 0 , 4* Math.PI, false )
        //ctx.fill();           

        var offs = (AVT_SIZE / 15);
        ctx.beginPath();
        ctx.fillStyle = '#72ACAB'
        ctx.arc(x - offs / 2, y, (AVT_SIZE - 4) / 2, 0, 4 * Math.PI, false)
        ctx.fill();

        // eye
        var eysz = AVT_SIZE / 6;
        ctx.beginPath();
        ctx.fillStyle = '#EEF'
        ctx.ellipse(x - offs, y - eysz, eysz / 4, eysz / BLINK_R, 0, 2 * Math.PI, false)
        ctx.ellipse(x + offs, y - eysz, eysz / 4, eysz / BLINK_L, 0, 2 * Math.PI, false)
        ctx.fill();

        // mouth
        var mousz = AVT_SIZE / 4;
        ctx.beginPath();
        ctx.fillStyle = '#3E8B8A'
        ctx.ellipse(x, y + AVT_SIZE / 8, mousz, eysz / 2, Math.PI, Math.PI * 2, false)
        ctx.fill();

        ctx.fillStyle = '#fff'
        ctx.fillRect(x - mousz / 3, y + AVT_SIZE / 16, mousz / 4, mousz / 3)
        ctx.fillRect(x + mousz / 10, y + AVT_SIZE / 16, mousz / 4, mousz / 3)
        ctx.rotate(-ANGLE)

    }


    var drawAvatar = function () {

        if (CANVAS[CANVAS_DRAW].getContext) {
            var ctx = CANVAS[CANVAS_DRAW].getContext('2d');

            AVATAR.x = (AVATAR_X - VP_LEFT) * D_CELL_SIZE + D_CELL_SIZE / 2;
            AVATAR.y = (AVATAR_Y - VP_TOP) * D_CELL_SIZE + D_CELL_SIZE / 2;

            renderAvatar(ctx)
        }

        $(CANVAS[1 - CANVAS_DRAW]).addClass('hidden');
        $(CANVAS[CANVAS_DRAW]).removeClass('hidden');

        CANVAS_DRAW = 1 - CANVAS_DRAW;

    }

    var blinkAvatar = function () {
        var ctx = CANVAS[1 - CANVAS_DRAW].getContext('2d');
        renderAvatar(ctx)
        AVATAR.blink -= 200;
        if (AVATAR.blink < 0)
            AVATAR.blink = Math.round(1000 + Math.random() * 5000);
        if (AVATAR.phase == 1) {
            if (AVATAR.angle > -15) AVATAR.angle -= 3;
            else AVATAR.phase = 2;
        }
        else if (AVATAR.phase == 2) {
            if (AVATAR.angle < 15) AVATAR.angle += 3;
            else AVATAR.phase = 1;
        }

        setTimeout(function () { blinkAvatar() }, 200)
    }


    // get mouse pos relative to CANVAS (yours is fine, this is just different)
    function getMousePos(CANVAS, evt) {
        var rect = CANVAS[1 - CANVAS_DRAW].getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    }

    // when mouse button is released (note: window, not CANVAS here)
    if (EDIT_MODE > 0) $(CANVAS).on('click', function (e) {

        var pos = getMousePos(CANVAS, e);
        var cl = pos.x / (D_CELL_SIZE);
        var rw = pos.y / (D_CELL_SIZE);

        var rN = Math.floor(rw);
        var cN = Math.floor(cl);

        //drawCell(AVATAR_X,AVATAR_Y, CELLS[AVATAR_Y][AVATAR_X]);
        AVATAR_X = cN + VP_LEFT;
        AVATAR_Y = rN + VP_TOP;
        redrawMaze();
    });

    var bitSubsctractOnce = function (number, bit) {
        return ((number & bit) == bit) ? number - bit : number;
    }

    var countDownToSave = function (delay) {
        if (delay) SYNC_READY = delay;
        if (SYNC_READY > 0) {
            //console.log("Status update pending ... {0}".format(SYNC_READY))
            SYNC_READY--;
            SYNC_EVT = setTimeout(countDownToSave, 1000);
        }
        else postStatus();
    }

    var postStatus = function () {

        console.log("Status update ...")

        $.ajax({
            url: './maze.json',
            type: 'post',
            dataType: 'json',
            success: function (data) {
                $('.title').html(data.msg);
            },
            data: JSON.stringify({ 'cells': CELLS })
        });
    }


    var installKeboardHook = function () {

        var zoomIn = function () {
            D_CELL_SIZE += 5;
            if (D_CELL_SIZE > 42) D_CELL_SIZE = 42;
            else {
                calculateWidth();
            }
        }

        var zoomOut = function () {
            D_CELL_SIZE -= 5;
            if (D_CELL_SIZE < 20) D_CELL_SIZE = 22;
            else {
                calculateWidth();
            }
        }

        $(".ariadne").on("click", function () { 
            ARIADNE = !ARIADNE; redrawMaze();
            console.log("Ariadne's help:",ARIADNE)
        });

        $(".zoom:first").on("click", function (e) {
            e.preventDefault();
            zoomIn();
        })
        $(".zoom:last").on("click", function (e) {
            e.preventDefault();
            zoomOut();
        })

        $(".whoami a").on("click", function (e) {
            e.preventDefault();
            AVATAR_X = ORIGINAL_X;
            AVATAR_Y = ORIGINAL_Y;
            AVATAR_TIME = AVATAR_MOVES = 0;
            $(".whoami span:last").text(AVATAR_MOVES);
            calculateWidth();
        })


        $('.anchor').bind('mousewheel', function (e) {
            if (e.originalEvent.wheelDelta / 120 > 0) zoomIn()
            else zoomOut()
        });

        // set keyboard hook
        var prevX = 0, prevY = 0;
        $(document).keydown(function (e) {
            var code = e.keyCode | e.which
            if (((code < 37) || (code > 40)) && (code != 32) && (code != 65) && (code != 66) && (code != 46)) return;

            prevX = AVATAR_X;
            prevY = AVATAR_Y;

            //console.log(AVATAR_X,AVATAR_Y)

            if (EDIT_MODE == 0 && ARIADNE) {
                CELLS[AVATAR_Y][AVATAR_X] -= (CELLS[AVATAR_Y][AVATAR_X] >> 3) << 3;
                CELLS[AVATAR_Y][AVATAR_X] |= (1 << 4);
            }

            if (EDIT_MODE > 0) {
                if (code == '46') { // key DEL
                    CELLS[AVATAR_Y][AVATAR_X] -= (CELLS[AVATAR_Y][AVATAR_X] >> 3) << 3;
                }
                else if (code == '65') { // key a
                    CELLS[AVATAR_Y][AVATAR_X] |= (1 << 3);
                }
                else if (code == '66') { // key b
                    CELLS[AVATAR_Y][AVATAR_X] |= (1 << 4);
                }
            }

            if (EDIT_MODE < 2) {
                // up arrow
                if ((code == '38') && (AVATAR_Y > 0) && ((CELLS[AVATAR_Y][AVATAR_X] & 2) != 2)) // UP
                    AVATAR_Y--;
                else if ((code == '40') && (AVATAR_Y < D_ROWS) && ((CELLS[AVATAR_Y + 1][AVATAR_X] & 2) != 2)) // DOWN
                    AVATAR_Y++;
                else if ((code == '37') && (AVATAR_X > 0) && ((CELLS[AVATAR_Y][AVATAR_X] & 1) != 1)) // LEFT
                    AVATAR_X--;
                else if ((code == '39') && (AVATAR_X < D_COLS) && ((CELLS[AVATAR_Y][AVATAR_X + 1] & 1) != 1)) // RIGHT
                    AVATAR_X++;

                var prevL = VP_LEFT, prevT = VP_TOP;
                centerAvatar();
                if ((VP_LEFT != prevL) || (VP_TOP != prevT) || ARIADNE)
                    computeMaze();

            }
            else {

                if (code == '32') {
                    CELLS[AVATAR_Y][AVATAR_X] = 3;
                }
                // up arrow
                else if ((code == '38') && (AVATAR_Y > 0)) {
                    CELLS[AVATAR_Y][AVATAR_X] = bitSubsctractOnce(CELLS[AVATAR_Y][AVATAR_X], 2);
                    AVATAR_Y--;
                }
                // down arrow OK
                else if ((code == '40') && (AVATAR_Y < D_ROWS)) {
                    CELLS[AVATAR_Y + 1][AVATAR_X] = bitSubsctractOnce(CELLS[AVATAR_Y + 1][AVATAR_X], 2);
                    AVATAR_Y++;
                }
                // left arrow
                else if ((code == '37') && (AVATAR_X > 0)) {
                    CELLS[AVATAR_Y][AVATAR_X] = bitSubsctractOnce(CELLS[AVATAR_Y][AVATAR_X], 1);
                    AVATAR_X--;
                }
                // right arrow OK
                else if ((code == '39') && (AVATAR_X < D_COLS)) {
                    CELLS[AVATAR_Y][AVATAR_X + 1] = bitSubsctractOnce(CELLS[AVATAR_Y][AVATAR_X + 1], 1);
                    AVATAR_X++;
                }

                centerAvatar();
                computeMaze();

            }

            if ((prevX != AVATAR_X) || (prevY != AVATAR_Y)) {
                AVATAR_MOVES++;
                $(".whoami span:last").text(AVATAR_MOVES)
                $.cookie("AVATAR_X", AVATAR_X)
                $.cookie("AVATAR_Y", AVATAR_Y)
                $.cookie("AVATAR_MOVES", AVATAR_MOVES)
            }


            //drawCell(prevX,prevY, CELLS[prevY][prevX]);
            //drawCell(AVATAR_X,AVATAR_Y, CELLS[AVATAR_Y][AVATAR_X]);
            redrawMaze();


            if (EDIT_MODE > 0) {
                if (SYNC_EVT) clearTimeout(SYNC_EVT);
                countDownToSave(5);

                $('.title').text("EDITMODE: {7}, DRAW TO: ax:{0} ay:{1} left:{2} top:{3}, cell:{4} RT{5} BL{6} ".format(AVATAR_X, AVATAR_Y, VP_LEFT, VP_TOP, CELLS[AVATAR_Y][AVATAR_X], CELLS[AVATAR_Y][AVATAR_X + 1], CELLS[AVATAR_Y + 1][AVATAR_X], EDIT_MODE))
            }


        }); // onkeydown

    }


    var redrawMaze = function () {

        $(".bkgrd").css('background-position', '{0}px {1}px'.format(-VP_LEFT * D_CELL_SIZE, -VP_TOP * D_CELL_SIZE))

        var ctx = CANVAS[CANVAS_DRAW].getContext('2d');
        ctx.font = "{0}px infinity".format(D_CELL_SIZE);

        ctx.clearRect(0, 0, Math.round($('.anchor').width()), Math.round($('.anchor').height()));
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(121,121,121,0.5)'
        for (var i = 0; i < LINES.base.length; i++) {

            var itm = LINES.base[i];
            if (itm[0] == C_MOVETO) ctx.moveTo(itm[1], itm[2]);
            else
                //if (itm[0] == C_LINETO) ctx.lineTo(itm[1],itm[2]);
                //else 
                if (itm[0] == C_RECT) {
                    ctx.fillStyle = itm[3];
                    ctx.fillRect(itm[1], itm[2], D_CELL_SIZE, D_CELL_SIZE);
                }
                else
                    if (itm[0] == C_TEXT) {

                        if (itm[3] == 'a') {
                            ctx.fillStyle = 'rgba(100,100,200,0.2)';
                            ctx.fillRect(itm[1], itm[2], D_CELL_SIZE, D_CELL_SIZE);
                        }
                        else {
                            ctx.textAlign = "left";
                            ctx.fillStyle = (ARIADNE && (itm[3] == 'J'))
                                ? 'rgba(100,100,200,0.9)'
                                : 'rgba(227,75,48,0.4)';
                            ctx.fillText(itm[3], itm[1], itm[2] - 6 + D_CELL_SIZE);
                        }


                    }
        }
        ctx.stroke();

        ctx.beginPath();
        ctx.strokeStyle = '#991F16'//rgba(185,95,0,0.9)'
        ctx.setLineDash([14, 4, 58, 3, 20, 4, 70, 3]);
        for (var i = 0; i < LINES.draw.length; i++) {
            var itm = LINES.draw[i];
            if (itm[0] == C_MOVETO) ctx.moveTo(itm[1], itm[2]);
            else
                if (itm[0] == C_CURVER) ctx.quadraticCurveTo(itm[1], itm[2], itm[3], itm[4]);
                else
                    if (itm[0] == C_LINETO) ctx.lineTo(itm[1], itm[2]);
        }
        ctx.stroke();


        drawAvatar()


        //console.log(AVATAR_REACHED_END, CELLS[AVATAR_Y][AVATAR_X],((CELLS[AVATAR_Y][AVATAR_X] & 16) == 16),(((CELLS[AVATAR_Y][AVATAR_X] & 16) == 16) && !AVATAR_REACHED_END))

        if (!ARIADNE && (CELLS[AVATAR_Y][AVATAR_X] < 30) && ((CELLS[AVATAR_Y][AVATAR_X] & 16) == 16) && (AVATAR_REACHED_END == 0)) {
            $.cookie("AVATAR_REACHED_END", 1);
            console.log(AVATAR_Y,AVATAR_X,CELLS[AVATAR_Y][AVATAR_X]);
            AVATAR_REACHED_END = true;
            $(".popup_end").bPopup({ modalClose: true, escClose: true, opacity: 0.6, });
        }


        if (ARIADNE)
            $(".ariadne").addClass("text-info")
        else
            $(".ariadne").removeClass("text-info")

    }

    var computeMaze = function () {

        LINES.base = []
        LINES.draw = []

        var mazeLine = function (x, y, x1, y1) {
            LINES.base.push([C_MOVETO, x, y])
            LINES.base.push([C_LINETO, x1, y1])
            handDrawLine(null, x, y, x1, y1);
        }


        // horisontal lines
        var x = 0, y = 0;
        for (var row = VP_TOP; row < VP_TOP + VIEW_ROWS; row++) {
            var len = 0;
            x = 0;
            if (row != 0) for (var col = VP_LEFT; col < VP_LEFT + VIEW_COLS; col++) {
                var st = CELLS[row][col];

                if ((st > 3) && (D_CELL_SIZE > 3) && RUNES[st >> 3])
                    LINES.base.push([C_TEXT, (col - VP_LEFT) * D_CELL_SIZE, y, RUNES[st >> 3]])

                // solver

                // if (row*2+1 < MAZE_BLOCKS.length)
                //    LINES.base.push([C_RECT, (col-VP_LEFT) * D_CELL_SIZE ,y , MAZE_BLOCKS[row*2+1][col*2+1].color])

                if ((st & 2) == 2) len++;
                else {
                    if (len > 0) mazeLine(x, y, x + (len * D_CELL_SIZE), y)

                    x = (col - VP_LEFT + 1) * D_CELL_SIZE;
                    len = 0;

                }
                //                    break;

            }
            if (len > 0) mazeLine(x, y, x + (len * D_CELL_SIZE), y);
            y += D_CELL_SIZE;
        }

        // vertical lines
        var x = 0, y = 0;
        for (var col = VP_LEFT; col < VP_LEFT + VIEW_COLS; col++) {
            y = 0;
            var len = 0;
            if (col != 0) for (var row = VP_TOP; row < VP_TOP + VIEW_ROWS; row++) {
                var st = CELLS[row][col]
                if ((st & 1) == 1) len++;
                else {
                    if (len > 0) mazeLine(x, y, x, y + (len * D_CELL_SIZE));

                    y = (row - VP_TOP + 1) * D_CELL_SIZE;
                    len = 0;
                }
            }
            if (len > 0) mazeLine(x, y, x, y + (len * D_CELL_SIZE));
            x += D_CELL_SIZE;
        }

    }


    var centerAvatar = function () {


        VP_LEFT = Math.round(AVATAR_X - VIEW_COLS / 2);
        if (VP_LEFT < 0) VP_LEFT = 0;
        if ((D_COLS - VP_LEFT) < VIEW_COLS) VP_LEFT = D_COLS - VIEW_COLS;
        if (VP_LEFT < 0) VP_LEFT = 0;

        VP_TOP = Math.round(AVATAR_Y - VIEW_ROWS / 2);
        if (VP_TOP < 0) VP_TOP = 0;
        if ((D_ROWS - VP_TOP) < VIEW_ROWS) VP_TOP = D_ROWS - VIEW_ROWS;
        if (VP_TOP < 0) VP_TOP = 0;
    }


    var calculateWidth = function () {

        var totalWidth = Math.round($('.anchor').width());
        var totalHeight = Math.round(window.innerHeight * 0.9);

        $('canvas').attr('width', totalWidth + 'px')
        $('canvas').attr('height', totalHeight + 'px')

        //console.log(totalWidth,totalHeight)

        VIEW_COLS = Math.round(totalWidth / D_CELL_SIZE) + 2;
        if (VIEW_COLS > D_COLS) VIEW_COLS = D_COLS;
        VIEW_ROWS = Math.round(totalHeight / D_CELL_SIZE) + 2
        if (VIEW_ROWS > D_ROWS) VIEW_ROWS = D_ROWS;

        centerAvatar();
        computeMaze()
        redrawMaze();

    }

    installKeboardHook()
    $(window).resize(calculateWidth)
    calculateWidth()




    CELLS = MAZE_DATA;
    while (CELLS.length < D_ROWS)
        CELLS.push([])

    /*
        
    for (var r=0; r<CELLS.length; r++) {
        while (CELLS[r].length < D_COLS)
            CELLS[r].push(3);
        for (var c=0; c<CELLS[r].length; c++) {
            if ((CELLS[r][c] < 4) && (CELLS[r][c] != 0)) {
                //var rune = 2 + Math.round(Math.random() * RUNES.length * 3)
                //if ((rune < RUNES.length) && RUNES[rune])
                //    CELLS[i][j] += (rune << 3);
            }
        }
        
    }
    */

    // transform cells into real matrix where wall = TRUE (blocked), walkway = FALSE
    MAZE_BLOCKS = [];
    for (var r = 0; r < D_ROWS; r++) {
        MAZE_BLOCKS.push(
            Array.apply(0, Array(D_COLS)).map(function (x, i) { return false }),
            Array.apply(0, Array(D_COLS)).map(function (x, i) { return false })
        );
        for (var c = 0; c < D_COLS; c++) {
            var st = CELLS[r][c];
            var verLine = ((st & 1) == 1); // |
            var horLine = ((st & 2) == 2); // -

            MAZE_BLOCKS[r * 2][c * 2 + 1] = { blocked: horLine }
            MAZE_BLOCKS[r * 2][c * 2] = { blocked: true }
            MAZE_BLOCKS[r * 2 + 1][c * 2 + 1] = { blocked: false, color: COLORS[Math.round(Math.random() * COLORS.length)] }
            MAZE_BLOCKS[r * 2 + 1][c * 2] = { blocked: verLine }

        }
    }


    console.log(MAZE_BLOCKS)
    console.log(CELLS)

    //MAZE_BLOCKS = solveMaze( MAZE_BLOCKS, D_COLS*2, D_ROWS*2, {startRow:22*2, startColumn:105*2,  endRow:22*2, endColumn:76*2}, null )         


    calculateWidth();
    blinkAvatar()


    // experimental
    if (document.getElementById("art")) {

        var iso = new Isomer(document.getElementById("art"), { angle: 4 });
        var Shape = Isomer.Shape;
        var Point = Isomer.Point;

        var scale = 0.2;

        for (var r = 0; r < MAZE_BLOCKS.length; r++)
            for (var c = 0; c < MAZE_BLOCKS[r].length; c++)
                if (MAZE_BLOCKS[r][c].blocked)
                    iso.add(
                        Shape.Prism(Point((-r + VP_LEFT) * scale, (-c + VP_TOP) * scale), scale, scale, scale)
                    );
    }



    var countMoves = function () {
        $("#seconds").html(pad(++AVATAR_TIME % 60));
        $("#minutes").html(pad(parseInt(AVATAR_TIME / 60, 10)));
    }

    $(window).blur(function () {
        clearInterval(AVATAR_TIMER);
    });
    $(window).focus(function () {
        clearInterval(AVATAR_TIMER);
        AVATAR_TIMER = setInterval(countMoves, 1000)
    });

    AVATAR_NAME = $.cookie("AVATAR_NAME")
    if (!AVATAR_NAME) {
        $(".popup").bPopup({ modalClose: false, escClose: false, opacity: 0.6, });
        $(".popup a").on("click", function (e) {
            if ($(".popup input").val()) {
                AVATAR_NAME = $(".popup input").val();
                $.cookie("AVATAR_NAME", AVATAR_NAME);
                $(".popup").bPopup().close()
                $(".whoami span:first").text(AVATAR_NAME);
            }
        })
    }
    else {
        $(".whoami span:first").text(AVATAR_NAME);
    }



    function pad(val) {
        return val > 9 ? val : "0" + val;
    }
    AVATAR_TIMER = setInterval(countMoves, 1000);



}


