/* */
"format cjs";var http=module.exports,EventEmitter=require("../events").EventEmitter,Request=require("./lib/request"),url=require("../url");http.request=function(e,t){"string"==typeof e&&(e=url.parse(e)),e||(e={}),e.host||e.port||(e.port=parseInt(window.location.port,10)),!e.host&&e.hostname&&(e.host=e.hostname),e.protocol||(e.protocol=e.scheme?e.scheme+":":window.location.protocol),e.host||(e.host=window.location.hostname||window.location.host),/:/.test(e.host)&&(e.port||(e.port=e.host.split(":")[1]),e.host=e.host.split(":")[0]),e.port||(e.port="https:"==e.protocol?443:80);var r=new Request(new xhrHttp,e);return t&&r.on("response",t),r},http.get=function(e,t){e.method="GET";var r=http.request(e,t);return r.end(),r},http.Agent=function(){},http.Agent.defaultMaxSockets=4;var xhrHttp=function(){if("undefined"==typeof window)throw new Error("no window object present");if(window.XMLHttpRequest)return window.XMLHttpRequest;if(window.ActiveXObject){for(var e=["Msxml2.XMLHTTP.6.0","Msxml2.XMLHTTP.3.0","Microsoft.XMLHTTP"],t=0;t<e.length;t++)try{var r=new window.ActiveXObject(e[t]);return function(){if(r){var n=r;return r=null,n}return new window.ActiveXObject(e[t])}}catch(n){}throw new Error("ajax not supported in this browser")}throw new Error("ajax not supported in this browser")}();http.STATUS_CODES={100:"Continue",101:"Switching Protocols",102:"Processing",200:"OK",201:"Created",202:"Accepted",203:"Non-Authoritative Information",204:"No Content",205:"Reset Content",206:"Partial Content",207:"Multi-Status",300:"Multiple Choices",301:"Moved Permanently",302:"Moved Temporarily",303:"See Other",304:"Not Modified",305:"Use Proxy",307:"Temporary Redirect",400:"Bad Request",401:"Unauthorized",402:"Payment Required",403:"Forbidden",404:"Not Found",405:"Method Not Allowed",406:"Not Acceptable",407:"Proxy Authentication Required",408:"Request Time-out",409:"Conflict",410:"Gone",411:"Length Required",412:"Precondition Failed",413:"Request Entity Too Large",414:"Request-URI Too Large",415:"Unsupported Media Type",416:"Requested Range Not Satisfiable",417:"Expectation Failed",418:"I'm a teapot",422:"Unprocessable Entity",423:"Locked",424:"Failed Dependency",425:"Unordered Collection",426:"Upgrade Required",428:"Precondition Required",429:"Too Many Requests",431:"Request Header Fields Too Large",500:"Internal Server Error",501:"Not Implemented",502:"Bad Gateway",503:"Service Unavailable",504:"Gateway Time-out",505:"HTTP Version Not Supported",506:"Variant Also Negotiates",507:"Insufficient Storage",509:"Bandwidth Limit Exceeded",510:"Not Extended",511:"Network Authentication Required"};
//# sourceMappingURL=index.js.map