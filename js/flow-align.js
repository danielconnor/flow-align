(function ($) {
    const VENDOR_PREFIXES = ["-webkit-","-moz-", "-ms-", "-o-",""];

    var split = function (element) {
        var words = element.textContent.trim().split(" "),
                nextChild = element.nextSibling;
        if (words.length) {
            element.textContent[0] == " " && element.parentNode.insertBefore(document.createTextNode(" "), element);
            for (var q = 0; q < words.length; q++) {
                if(words[q].trim().length === 0) continue;
                var wordSpan = element.parentNode.insertBefore(document.createElement("span"), element);
                wordSpan.className = "flow";
                wordSpan.textContent = words[q];
                element.parentNode.insertBefore(wordSpan, element);
                if (q < words.length - 1 || element.textContent[element.textContent.length - 1] == " ") element.parentNode.insertBefore(document.createTextNode(" "), element);
            }
            element.parentNode.removeChild(element);
        }
        return nextChild;
    };


    // recurses each node begining from element and splits the words into seperate spans
    var recurse = function (element) {
        if (element.nodeName === "STYLE" || element.nodeName === "SCRIPT") return;

        var el = element.firstChild;

        while (el) {
            if (el instanceof Text) {
                el = split(el);
            }
            else {
                recurse(el);
                el = el.nextSibling;
            }
        }
    };


    var generateStyle = function(speed,timingFunction) {
        var style = ".animate .flow { "
        for(var i = 0; i < VENDOR_PREFIXES.length; i++) {
            style += 
                VENDOR_PREFIXES[i] + "transition-property: top,left;" + 
                VENDOR_PREFIXES[i] + "transition-timing-function:" + timingFunction + ";" +
                VENDOR_PREFIXES[i] + "transition-duration:" + speed / 1000 + "s;";
        }
        return style + "}";
    }

    $.fn.flowTextAlign = function (options) {
        var hidden,
            original,
            animate,
            speed,
            timeout,
            animateStyle,
            delay,
            setOptions = function (options) {
                animate = options.animate || animate || "none"; //jquery | css | none
                animate == "css" ? original.addClass("animate") : original.removeClass("animate");
                speed = options.speed || speed || 500; //number - miliseconds
                timingFunction = options.timingFunction || timingFunction || "ease-out";
                delay = options.delay || delay || 200;

                animateStyle.html(generateStyle(speed,timingFunction));
            },
            update = function () {
                original.css({
                    height: hidden.height(),
                });

                var hiddenWords = hidden.find(".flow"),
                    originalWords = original.find(".flow");

                for (var i = 0; i < hiddenWords.length; i++) {
                    var position = hiddenWords.eq(i).position();
                    if (animate == "jquery") {
                        originalWords.eq(i)
                            .stop()
                            .animate({
                                top: position.top + "px",
                                left: position.left + "px"
                            }, parseInt(speed));
                    }
                    else if (!animate || animate == "css" || animate == "none") {
                        originalWords.eq(i).css("top", position.top + "px");
                        originalWords.eq(i).css("left", position.left + "px");
                    }
                }
            };


        if (this.length > 1) {
            for (var i = 0,il = this.length; i < il; i++) {
                this.eq(i).flowTextAlign(options);
            }
            return this;
        }

        animateStyle = $("<style></style>").appendTo("head");
        original = this;
        recurse(original[0]);

        hidden =
        original.clone()
                .appendTo($("<div></div>")
                .css({
                    position: "absolute",
                    top: -9999 + "px",
                    left: -9999 + "px",
                    width: "100%",
                    height: "100%"
                })
                .appendTo(original.parent()));

        original.css({
                    position:"relative"
                })
                .attr({
                    id :""
                })
                .find("*")
                .css({
                    position: "absolute",
                    margin: "0",
                    padding: "0"
                });
        hidden.update = update;
        hidden.setOptions = setOptions;

        $(window).resize(function () {
            clearTimeout(timeout);
            timeout = setTimeout(update, delay);
        });

        update();
        setOptions(options);
        return hidden;
    };
})(jQuery);