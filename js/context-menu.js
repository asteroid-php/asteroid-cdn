// Custom Context Menu

// First, add function to select text.
jQuery.fn.selectText = function() {
    var element, range, selection;
    $(this).each(function() {
        element = $(this)[0];
        if(document.body.createTextRange) {
            range = document.body.createTextRange();
            range.moveToElementText(element);
            range.select();
        } else if(window.getSelection) {
            selection = window.getSelection();        
            range = document.createRange();
            range.selectNodeContents(element);
            selection.removeAllRanges();
            selection.addRange(range);
        }
    });
};

$(document).on("contextmenu", function(event) {
    event.preventDefault();
    //console.log(event);
    event.srcElement = event.target;
    $(".context-menu").remove();
    var $context_menu = $("<div></div>").attr({
        "id": "context-menu"
    }).addClass("context-menu").css({
        top: (event.pageY - 10) + "px", left: (event.pageX - 10) + "px",
        position: "absolute", "z-index": 1000000, "min-width": "150px",
        "max-width": "180px", "min-height": "50px", padding: "10px 0px",
        border: "0px solid black", "border-radius": "0px",
        background: "rgba(0, 0, 0, 0.8)", color: "#ffffff",
        "box-shadow": "0px 0px 5px #000000"
    }).on("mouseleave", function() {
        $("body").css("overflow", "auto");
        $(this).fadeOut(100, function() { $(this).remove(); });
    }).appendTo("body");
    $("body").css("overflow", "hidden");
    
    var menu = {
        "Refresh": function() { $(window).trigger("statechange"); },
        "Scroll To Top": function() { $("html, body").animate({ scrollTop: 0 }); },
        "Force Refresh": function() { window.location.reload(true); },
        "Go": function() { $.fancybox.open("<div class=\"content\"><h3>Go</h3><form action=\"javascript:\" onsubmit=\"History.pushState(null, null, $(this).find('input').val())\"><input class=\"text\" type=\"text\" name=\"next_url\" value=\"/\" /><br /><button class=\"button\" type=\"submit\">Open</button></form><script>$(\"input[name='next_url']\").val(window.location.pathname);</script></div>"); },
        "Back": function() { window.history.go(-1); },
        "Forward": function() { window.history.go(1); },
        //"Alert": function() { $(this).append(" <span class=\"ui-icon ui-icon-check\"></span>"); },
        //"Lol !?!": function() { $.fancybox.open("<div class=\"content\"><span class=\"ui-icon ui-icon-flag\"></span> You clicked on the action 'Lol !?!'.</div>"); },
        "Select All": function() { $(".article").selectText(); }
    };
    
    var $element = $(event.srcElement);
    if(($element.filter(".content").length > 0) || ($element.parents(".content").length > 0)) menu["Select Content"] = function() {
        if($element.filter(".content").length > 0) var $a = $element;
        else var $a = $element.parents(".content").filter(":first");
        $a.selectText();
    }; if(($element.filter("pre").children().filter("code").length == 1) || ($element.filter("code").parent().filter("pre").length > 0) || ($element.parents("code").parent("pre").length > 0)) menu["Select Code"] = function() {
        if($element.filter("pre").children().filter("code").length == 1) var $a = $element;
        else if($element.filter("code").parent().filter("pre").length > 0) var $a = $element.parent();
        else var $a = $element.parents("code").parent().filter(":first");
        $a.selectText();
    }; if(($element.filter(".fancybox-wrap, .fancybox-overlay").length > 0) || ($element.parents(".fancybox-wrap, .fancybox-overlay").length > 0)) { menu["Select Fancybox"] = function() {
        if($element.filter(".fancybox-wrap, .fancybox-overlay").length > 0) var $a = $element;
        else var $a = $element.parents(".fancybox-wrap, .fancybox-overlay").filter(":first");
        $a.selectText();
    }; menu["Close Fancybox"] = function() {
        $.fancybox.close();
    }; } else if(($element.filter("img").length > 0) && !$element.hasClass("emoji")) menu["Open in Fancybox"] = function() {
        $.fancybox.open({ href: $element.attr("src"), type: "image" });
    }; if($element.hasClass("emoji")) menu["Emoji Guide"] = function() {
        $.emoji.guide($element.attr("data-emoji"));
    }; if(($element.filter("a").length > 0) || ($element.parents("a").length > 0)) {
        if($element.filter("a").length > 0) var $a = $element;
        else var $a = $element.parents("a").filter(":first");
        menu["Open"] = function() {
            var a_events = $._data($a[0], "events") || {};
            if((typeof a_events.click != "undefined") && (a_events.click.length > 0)) $a.click();
            else window.location = $a.attr("href");
        }; if($a.attr("href").substr(0, 11) != "javascript:") menu["Open in New Tab / Window"] = function() {
            window.open($a.attr("href"));
        }; if($a.filter(":internal").length > 0) menu["Open in Fancybox"] = function() {
            $.fancybox.open({ href: $a.attr("href"), type: "ajax" });
        };
    }
    
    for(i in menu) {
        // Add menu items
        $("<div></div>").html(i).attr({
            
        }).css({
            "padding": "5px 15px",
            //"border-bottom": "1px solid #ffffff",
            "color": "#ffffff",
            "transition": "background-color 0.5s ease",
            "cursor": "pointer"
        }).click(menu[i]).on("mouseenter", function(event) {
            $(this).css("background-color", "rgba(0, 0, 0, 0.8)");
        }).on("mouseleave", function(event) {
            $(this).css("background-color", "");
        }).appendTo(".context-menu");
    };
    
    // Check if menu may be hidden?
    // If so, move menu up / down / left / right.
    var dh = $(document).height();
    var wh = $(window).height();
    var ww = $(window).width();
    var mh = $(".context-menu").height();
    var mw = $(".context-menu").width();
    var st = $(document).scrollTop();
    var sl = $(document).scrollLeft();
    var sy = event.pageY;
    var sx = event.pageX;
    var ct = sy - st;
    var cl = sx - sl;
    /* console.log({
        "docheight": dh, "windowheight": wh, "menuheight": mh, "scrolltop": st, "clicktoppage": sy, "clicktopwindow": ct,
        "windowwidth": ww, "menuwidth": mw, "scrollleft": sl, "clickleftpage": sx, "clickleftwindow": cl,
        "clickrightwindow": ww - cl
    }); //*/
    if((ct - 10) < 10) $(".context-menu").css("top", "10px"); // Top
    if((wh - ct - 20) < mh) $(".context-menu").css("top", ((st + wh) - mh - 30) + "px"); // Bottom
    if((sx - 10) < 10) $(".context-menu").css("left", "10px"); // Left
    if((ww - cl - 20) < mw) $(".context-menu").css("left", ((sl + ww) - mw - 10) + "px"); // Right
    
    //$(".context-menu").children(":last-child").css("border-bottom", "0px none");
}); //document.oncontextmenu.enabled = true;
