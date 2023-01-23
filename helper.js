if (!Array.prototype.sum) 
  Array.prototype.sum = function() {
        return this.reduce(function(a, b) {
            return a + b;
        });
  }

if (!Array.prototype.filter) {
  Array.prototype.filter = function(fun /*, thisp*/) {
    var len = this.length >>> 0;
    if (typeof fun != "function")
    throw new TypeError();

    var res = [];
    var thisp = arguments[1];
    for (var i = 0; i < len; i++) {
      if (i in this) {
        var val = this[i]; // in case fun mutates this
        if (fun.call(thisp, val, i, this))
        res.push(val);
      }
    }
    return res;
  };
}  
  
if (!Date.prototype.getWeek) 
    Date.prototype.getWeek = function() {
        var onejan = new Date(this.getFullYear(), 0, 1);
        return Math.ceil((((this - onejan) / 86400000) + onejan.getDay() + 1) / 7);
    }



if (!String.prototype.parseDate)
    String.prototype.parseDate = function() {
    var regex = /(\d{1,4})[ -/]+(\d{2})[ -/]+(\d{2}).*$/;
    match = regex.exec(this);
    if (match)
        return new Date(match[1], match[2]-1, match[3], 0, 0 , 0, 0);
    else
        return new Date(this)
    
}

if (!String.prototype.endsWith)
    String.prototype.endsWith = function(suffix) {
        return this.indexOf(suffix, this.length - suffix.length) !== -1;
    };

if (!String.prototype.startsWith)    
    String.prototype.startsWith = function(suffix) {
        return this.indexOf(suffix) == 0;
    };

if (!String.prototype.contains)    
    String.prototype.contains = function(suffix) {
        return this.indexOf(suffix) != -1;
    };

if (!Array.prototype.contains)    
    Array.prototype.contains = function(suffix) {
        return this.indexOf(suffix) != -1;
    };
    
    
if (!String.prototype.format) {
	  String.prototype.format = function() {
		var args = arguments;
		return this.replace(/{(\d+)}/g, function(match, number) { 
			return typeof args[number] != 'undefined'
				? args[number]
				: match
			;
		});
	  };
} 

if (!Number.prototype.pad) 
     Number.prototype.pad = function( size) {
        var s = "000000000" + this;
        return s.substr(s.length-size);
    }


if (!Number.prototype.format) 

    Number.prototype.format = function number_format(decimals, dec_point, thousands_sep) {
        
        var number = this;
        
        // http://kevin.vanzonneveld.net
        // +   original by: Jonas Raoni Soares Silva (http://www.jsfromhell.com)
        // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
        // +     bugfix by: Michael White (http://getsprink.com)
        // +     bugfix by: Benjamin Lupton
        // +     bugfix by: Allan Jensen (http://www.winternet.no)
        // +    revised by: Jonas Raoni Soares Silva (http://www.jsfromhell.com)
        // +     bugfix by: Howard Yeend
        // +    revised by: Luke Smith (http://lucassmith.name)
        // +     bugfix by: Diogo Resende
        // +     bugfix by: Rival
        // +      input by: Kheang Hok Chin (http://www.distantia.ca/)
        // +   improved by: davook
        // +   improved by: Brett Zamir (http://brett-zamir.me)
        // +      input by: Jay Klehr
        // +   improved by: Brett Zamir (http://brett-zamir.me)
        // +      input by: Amir Habibi (http://www.residence-mixte.com/)
        // +     bugfix by: Brett Zamir (http://brett-zamir.me)
        // +   improved by: Theriault
        // +   improved by: Drew Noakes
        // *     example 1: number_format(1234.56);
        // *     returns 1: '1,235'
        // *     example 2: number_format(1234.56, 2, ',', ' ');
        // *     returns 2: '1 234,56'
        // *     example 3: number_format(1234.5678, 2, '.', '');
        // *     returns 3: '1234.57'
        // *     example 4: number_format(67, 2, ',', '.');
        // *     returns 4: '67,00'
        // *     example 5: number_format(1000);
        // *     returns 5: '1,000'
        // *     example 6: number_format(67.311, 2);
        // *     returns 6: '67.31'
        // *     example 7: number_format(1000.55, 1);
        // *     returns 7: '1,000.6'
        // *     example 8: number_format(67000, 5, ',', '.');
        // *     returns 8: '67.000,00000'
        // *     example 9: number_format(0.9, 0);
        // *     returns 9: '1'
        // *    example 10: number_format('1.20', 2);
        // *    returns 10: '1.20'
        // *    example 11: number_format('1.20', 4);
        // *    returns 11: '1.2000'
        // *    example 12: number_format('1.2000', 3);
        // *    returns 12: '1.200'
        var n = !isFinite(+number) ? 0 : +number, 
            prec = !isFinite(+decimals) ? 0 : Math.abs(decimals),
            sep = (typeof thousands_sep === 'undefined') ? ',' : thousands_sep,
            dec = (typeof dec_point === 'undefined') ? '.' : dec_point,
            toFixedFix = function (n, prec) {
                // Fix for IE parseFloat(0.55).toFixed(0) = 0;
                var k = Math.pow(10, prec);
                return Math.round(n * k) / k;
            },
            s = (prec ? toFixedFix(n, prec) : Math.round(n)).toString().split('.');
        if (s[0].length > 3) {
            s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep);
        }
        if ((s[1] || '').length < prec) {
            s[1] = s[1] || '';
            s[1] += new Array(prec - s[1].length + 1).join('0');
        }
        return s.join(dec);
    }



function findMedian(data, valueFn) {

    // extract the .values field and sort the resulting array
    var m = data.map(valueFn).sort(function(a, b) {
        return a - b;
    });

    var middle = Math.floor((m.length - 1) / 2); // NB: operator precedence
    if (m.length % 2) {
        return m[middle];
    } else {
        return (m[middle] + m[middle + 1]) / 2.0;
    }
}

function findMean(data, valueFn) {

    // extract the .values field and sort the resulting array
    var m = data.map(valueFn).sort(function(a, b) {
        return a - b;
    });
    
    var sum = 0;
    for( var i = 0; i < m.length; i++ ){
        sum += m[i];
    }

    return sum/m.length;

}

function s2i(str) {
    if (!str) return 0;
    if (typeof(str) == "number") return str.toFixed(0)
    var i = parseInt(str.replace(/[^0-9\.]+/g, ''))
    return isNaN(i) ? 0 : i;
}

function s2f(str) {
    if (!str) return 0;
    if (typeof(str) == "number") return str.toFixed(2)
    var i = parseFloat(str.replace(/[^0-9\.]+/g, ''))
    return isNaN(i) ? 0 : i;
}



(function( func ) {
    $.fn.addClass = function() { // replace the existing function on $.fn
        func.apply( this, arguments ); // invoke the original function
        this.trigger('classChanged'); // trigger the custom event
        return this; // retain jQuery chainability
    }
})($.fn.addClass); // pass the original function as an argument

(function( func ) {
    $.fn.removeClass = function() {
        func.apply( this, arguments );
        this.trigger('classChanged');
        return this;
    }
})($.fn.removeClass);


Number.prototype.between = function (min, max) {
    return (this >= min) && (this <= max)
}


Number.prototype.formatSeconds = function () {
    var sec_num = this
    var hours   = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = sec_num - (hours * 3600) - (minutes * 60);

    if (hours   < 10) {hours   = "0"+hours;}
    if (minutes < 10) {minutes = "0"+minutes;}
    if (seconds < 10) {seconds = "0"+seconds;}
    var time    = hours+':'+minutes+':'+seconds;
    return time;
}

Number.prototype.formatMinutes = function (isShort) {
    var sec_num = this
    if (sec_num == 0) return "0h"
    
    var days = Math.floor(sec_num / 1440);
    var hours = Math.floor((sec_num - (days * 1440)) / 60);
    var minutes = sec_num - (days * 1440) - (hours * 60);

    if (hours   < 10) {hours   = "0"+hours;}
    if (minutes < 10) {minutes = "0"+minutes;}
    var time =  ((days > 0) ? days + "d " : "") + hours+'h '+minutes+'m';
    
    if (isShort && (days > 0)) return days + "d " + hours+'h ';
    
    return time;
}

Number.prototype.formatBusinessMinutes = function (isShort) {
    var sec_num = this
    if (sec_num == 0) return "0bh"
    
    
    var days = Math.floor(sec_num / 480);
    var hours = Math.floor((sec_num - (days * 480)) / 60);
    var minutes = sec_num - (days * 480) - (hours * 60);

    if (hours   < 10) {hours   = "0"+hours;}
    if (minutes < 10) {minutes = "0"+minutes;}
    var time =  ((days > 0) ? days + "bd " : "") + hours+'h '+minutes+'m';
    
    if (isShort && (days > 0)) return days + "bd " + hours+'h ';
    
    return time;
}

