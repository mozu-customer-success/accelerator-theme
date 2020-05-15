
/**
 * bxSlider v4.2.12
 * Copyright 2013-2015 Steven Wanderski
 * Written while drinking Belgian ales and listening to jazz
 * Licensed under MIT (http://opensource.org/licenses/MIT)
 */
!function(t){var e={mode:"horizontal",slideSelector:"",infiniteLoop:!0,hideControlOnEnd:!1,speed:500,easing:null,slideMargin:0,startSlide:0,randomStart:!1,captions:!1,ticker:!1,tickerHover:!1,adaptiveHeight:!1,adaptiveHeightSpeed:500,video:!1,useCSS:!0,preloadImages:"visible",responsive:!0,slideZIndex:50,wrapperClass:"bx-wrapper",touchEnabled:!0,swipeThreshold:50,oneToOneTouch:!0,preventDefaultSwipeX:!0,preventDefaultSwipeY:!1,ariaLive:!0,ariaHidden:!0,keyboardEnabled:!1,pager:!0,pagerType:"full",pagerShortSeparator:" / ",pagerSelector:null,buildPager:null,pagerCustom:null,controls:!0,nextText:"Next",prevText:"Prev",nextSelector:null,prevSelector:null,autoControls:!1,startText:"Start",stopText:"Stop",autoControlsCombine:!1,autoControlsSelector:null,auto:!1,pause:4e3,autoStart:!0,autoDirection:"next",stopAutoOnClick:!1,autoHover:!1,autoDelay:0,autoSlideForOnePage:!1,minSlides:1,maxSlides:1,moveSlides:0,slideWidth:0,shrinkItems:!1,onSliderLoad:function(){return!0},onSlideBefore:function(){return!0},onSlideAfter:function(){return!0},onSlideNext:function(){return!0},onSlidePrev:function(){return!0},onSliderResize:function(){return!0},onAutoChange:function(){return!0}};t.fn.bxSlider=function(n){if(0===this.length)return this;if(this.length>1)return this.each(function(){t(this).bxSlider(n)}),this;var s={},o=this,r=t(window).width(),a=t(window).height();if(!t(o).data("bxSlider")){var l=function(){t(o).data("bxSlider")||(s.settings=t.extend({},e,n),s.settings.slideWidth=parseInt(s.settings.slideWidth),s.children=o.children(s.settings.slideSelector),s.children.length<s.settings.minSlides&&(s.settings.minSlides=s.children.length),s.children.length<s.settings.maxSlides&&(s.settings.maxSlides=s.children.length),s.settings.randomStart&&(s.settings.startSlide=Math.floor(Math.random()*s.children.length)),s.active={index:s.settings.startSlide},s.carousel=s.settings.minSlides>1||s.settings.maxSlides>1,s.carousel&&(s.settings.preloadImages="all"),s.minThreshold=s.settings.minSlides*s.settings.slideWidth+(s.settings.minSlides-1)*s.settings.slideMargin,s.maxThreshold=s.settings.maxSlides*s.settings.slideWidth+(s.settings.maxSlides-1)*s.settings.slideMargin,s.working=!1,s.controls={},s.interval=null,s.animProp="vertical"===s.settings.mode?"top":"left",s.usingCSS=s.settings.useCSS&&"fade"!==s.settings.mode&&function(){for(var t=document.createElement("div"),e=["WebkitPerspective","MozPerspective","OPerspective","msPerspective"],i=0;i<e.length;i++)if(void 0!==t.style[e[i]])return s.cssPrefix=e[i].replace("Perspective","").toLowerCase(),s.animProp="-"+s.cssPrefix+"-transform",!0;return!1}(),"vertical"===s.settings.mode&&(s.settings.maxSlides=s.settings.minSlides),o.data("origStyle",o.attr("style")),o.children(s.settings.slideSelector).each(function(){t(this).data("origStyle",t(this).attr("style"))}),d())},d=function(){var e=s.children.eq(s.settings.startSlide);o.wrap('<div class="'+s.settings.wrapperClass+'"><div class="bx-viewport"></div></div>'),s.viewport=o.parent(),s.settings.ariaLive&&!s.settings.ticker&&s.viewport.attr("aria-live","polite"),s.loader=t('<div class="bx-loading" />'),s.viewport.prepend(s.loader),o.css({width:"horizontal"===s.settings.mode?1e3*s.children.length+215+"%":"auto",position:"relative"}),s.usingCSS&&s.settings.easing?o.css("-"+s.cssPrefix+"-transition-timing-function",s.settings.easing):s.settings.easing||(s.settings.easing="swing"),s.viewport.css({width:"100%",overflow:"hidden",position:"relative"}),s.viewport.parent().css({maxWidth:u()}),s.children.css({float:"horizontal"===s.settings.mode?"left":"none",listStyle:"none",position:"relative"}),s.children.css("width",h()),"horizontal"===s.settings.mode&&s.settings.slideMargin>0&&s.children.css("marginRight",s.settings.slideMargin),"vertical"===s.settings.mode&&s.settings.slideMargin>0&&s.children.css("marginBottom",s.settings.slideMargin),"fade"===s.settings.mode&&(s.children.css({position:"absolute",zIndex:0,display:"none"}),s.children.eq(s.settings.startSlide).css({zIndex:s.settings.slideZIndex,display:"block"})),s.controls.el=t('<div class="bx-controls" />'),s.settings.captions&&P(),s.active.last=s.settings.startSlide===f()-1,s.settings.video&&o.fitVids(),("all"===s.settings.preloadImages||s.settings.ticker)&&(e=s.children),s.settings.ticker?s.settings.pager=!1:(s.settings.controls&&C(),s.settings.auto&&s.settings.autoControls&&T(),s.settings.pager&&w(),(s.settings.controls||s.settings.autoControls||s.settings.pager)&&s.viewport.after(s.controls.el)),c(e,g)},c=function(e,i){var n=e.find('img:not([src=""]), iframe').length,s=0;if(0===n)return void i();e.find('img:not([src=""]), iframe').each(function(){t(this).one("load error",function(){++s===n&&i()}).each(function(){(this.complete||""==this.src)&&t(this).trigger("load")})})},g=function(){if(s.settings.infiniteLoop&&"fade"!==s.settings.mode&&!s.settings.ticker){var e="vertical"===s.settings.mode?s.settings.minSlides:s.settings.maxSlides,i=s.children.slice(0,e).clone(!0).addClass("bx-clone"),n=s.children.slice(-e).clone(!0).addClass("bx-clone");s.settings.ariaHidden&&(i.attr("aria-hidden",!0),n.attr("aria-hidden",!0)),o.append(i).prepend(n)}s.loader.remove(),m(),"vertical"===s.settings.mode&&(s.settings.adaptiveHeight=!0),s.viewport.height(p()),o.redrawSlider(),s.settings.onSliderLoad.call(o,s.active.index),s.initialized=!0,s.settings.responsive&&t(window).bind("resize",U),s.settings.auto&&s.settings.autoStart&&(f()>1||s.settings.autoSlideForOnePage)&&L(),s.settings.ticker&&O(),s.settings.pager&&I(s.settings.startSlide),s.settings.controls&&D(),s.settings.touchEnabled&&!s.settings.ticker&&Y(),s.settings.keyboardEnabled&&!s.settings.ticker&&t(document).keydown(X)},p=function(){var e=0,n=t();if("vertical"===s.settings.mode||s.settings.adaptiveHeight)if(s.carousel){var o=1===s.settings.moveSlides?s.active.index:s.active.index*x();for(n=s.children.eq(o),i=1;i<=s.settings.maxSlides-1;i++)n=o+i>=s.children.length?n.add(s.children.eq(i-1)):n.add(s.children.eq(o+i))}else n=s.children.eq(s.active.index);else n=s.children;return"vertical"===s.settings.mode?(n.each(function(i){e+=t(this).outerHeight()}),s.settings.slideMargin>0&&(e+=s.settings.slideMargin*(s.settings.minSlides-1))):e=Math.max.apply(Math,n.map(function(){return t(this).outerHeight(!1)}).get()),"border-box"===s.viewport.css("box-sizing")?e+=parseFloat(s.viewport.css("padding-top"))+parseFloat(s.viewport.css("padding-bottom"))+parseFloat(s.viewport.css("border-top-width"))+parseFloat(s.viewport.css("border-bottom-width")):"padding-box"===s.viewport.css("box-sizing")&&(e+=parseFloat(s.viewport.css("padding-top"))+parseFloat(s.viewport.css("padding-bottom"))),e},u=function(){var t="100%";return s.settings.slideWidth>0&&(t="horizontal"===s.settings.mode?s.settings.maxSlides*s.settings.slideWidth+(s.settings.maxSlides-1)*s.settings.slideMargin:s.settings.slideWidth),t},h=function(){var t=s.settings.slideWidth,e=s.viewport.width();if(0===s.settings.slideWidth||s.settings.slideWidth>e&&!s.carousel||"vertical"===s.settings.mode)t=e;else if(s.settings.maxSlides>1&&"horizontal"===s.settings.mode){if(e>s.maxThreshold)return t;e<s.minThreshold?t=(e-s.settings.slideMargin*(s.settings.minSlides-1))/s.settings.minSlides:s.settings.shrinkItems&&(t=Math.floor((e+s.settings.slideMargin)/Math.ceil((e+s.settings.slideMargin)/(t+s.settings.slideMargin))-s.settings.slideMargin))}return t},v=function(){var t=1,e=null;return"horizontal"===s.settings.mode&&s.settings.slideWidth>0?s.viewport.width()<s.minThreshold?t=s.settings.minSlides:s.viewport.width()>s.maxThreshold?t=s.settings.maxSlides:(e=s.children.first().width()+s.settings.slideMargin,t=Math.floor((s.viewport.width()+s.settings.slideMargin)/e)||1):"vertical"===s.settings.mode&&(t=s.settings.minSlides),t},f=function(){var t=0,e=0,i=0;if(s.settings.moveSlides>0){if(!s.settings.infiniteLoop){for(;e<s.children.length;)++t,e=i+v(),i+=s.settings.moveSlides<=v()?s.settings.moveSlides:v();return i}t=Math.ceil(s.children.length/x())}else t=Math.ceil(s.children.length/v());return t},x=function(){return s.settings.moveSlides>0&&s.settings.moveSlides<=v()?s.settings.moveSlides:v()},m=function(){var t,e,i;s.children.length>s.settings.maxSlides&&s.active.last&&!s.settings.infiniteLoop?"horizontal"===s.settings.mode?(e=s.children.last(),t=e.position(),S(-(t.left-(s.viewport.width()-e.outerWidth())),"reset",0)):"vertical"===s.settings.mode&&(i=s.children.length-s.settings.minSlides,t=s.children.eq(i).position(),S(-t.top,"reset",0)):(t=s.children.eq(s.active.index*x()).position(),s.active.index===f()-1&&(s.active.last=!0),void 0!==t&&("horizontal"===s.settings.mode?S(-t.left,"reset",0):"vertical"===s.settings.mode&&S(-t.top,"reset",0)))},S=function(e,i,n,r){var a,l;s.usingCSS?(l="vertical"===s.settings.mode?"translate3d(0, "+e+"px, 0)":"translate3d("+e+"px, 0, 0)",o.css("-"+s.cssPrefix+"-transition-duration",n/1e3+"s"),"slide"===i?(o.css(s.animProp,l),0!==n?o.bind("transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd",function(e){t(e.target).is(o)&&(o.unbind("transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd"),A())}):A()):"reset"===i?o.css(s.animProp,l):"ticker"===i&&(o.css("-"+s.cssPrefix+"-transition-timing-function","linear"),o.css(s.animProp,l),0!==n?o.bind("transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd",function(e){t(e.target).is(o)&&(o.unbind("transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd"),S(r.resetValue,"reset",0),F())}):(S(r.resetValue,"reset",0),F()))):(a={},a[s.animProp]=e,"slide"===i?o.animate(a,n,s.settings.easing,function(){A()}):"reset"===i?o.css(s.animProp,e):"ticker"===i&&o.animate(a,n,"linear",function(){S(r.resetValue,"reset",0),F()}))},b=function(){for(var e="",i="",n=f(),o=0;o<n;o++)i="",s.settings.buildPager&&t.isFunction(s.settings.buildPager)||s.settings.pagerCustom?(i=s.settings.buildPager(o),s.pagerEl.addClass("bx-custom-pager")):(i=o+1,s.pagerEl.addClass("bx-default-pager")),e+='<div class="bx-pager-item"><a href="" data-slide-index="'+o+'" class="bx-pager-link">'+i+"</a></div>";s.pagerEl.html(e)},w=function(){s.settings.pagerCustom?s.pagerEl=t(s.settings.pagerCustom):(s.pagerEl=t('<div class="bx-pager" />'),s.settings.pagerSelector?t(s.settings.pagerSelector).html(s.pagerEl):s.controls.el.addClass("bx-has-pager").append(s.pagerEl),b()),s.pagerEl.on("click touchend","a",z)},C=function(){s.controls.next=t('<a class="bx-next" href="">'+s.settings.nextText+"</a>"),s.controls.prev=t('<a class="bx-prev" href="">'+s.settings.prevText+"</a>"),s.controls.next.bind("click touchend",k),s.controls.prev.bind("click touchend",E),s.settings.nextSelector&&t(s.settings.nextSelector).append(s.controls.next),s.settings.prevSelector&&t(s.settings.prevSelector).append(s.controls.prev),s.settings.nextSelector||s.settings.prevSelector||(s.controls.directionEl=t('<div class="bx-controls-direction" />'),s.controls.directionEl.append(s.controls.prev).append(s.controls.next),s.controls.el.addClass("bx-has-controls-direction").append(s.controls.directionEl))},T=function(){s.controls.start=t('<div class="bx-controls-auto-item"><a class="bx-start" href="">'+s.settings.startText+"</a></div>"),s.controls.stop=t('<div class="bx-controls-auto-item"><a class="bx-stop" href="">'+s.settings.stopText+"</a></div>"),s.controls.autoEl=t('<div class="bx-controls-auto" />'),s.controls.autoEl.on("click",".bx-start",M),s.controls.autoEl.on("click",".bx-stop",y),s.settings.autoControlsCombine?s.controls.autoEl.append(s.controls.start):s.controls.autoEl.append(s.controls.start).append(s.controls.stop),s.settings.autoControlsSelector?t(s.settings.autoControlsSelector).html(s.controls.autoEl):s.controls.el.addClass("bx-has-controls-auto").append(s.controls.autoEl),q(s.settings.autoStart?"stop":"start")},P=function(){s.children.each(function(e){var i=t(this).find("img:first").attr("title");void 0!==i&&(""+i).length&&t(this).append('<div class="bx-caption"><span>'+i+"</span></div>")})},k=function(t){t.preventDefault(),s.controls.el.hasClass("disabled")||(s.settings.auto&&s.settings.stopAutoOnClick&&o.stopAuto(),o.goToNextSlide())},E=function(t){t.preventDefault(),s.controls.el.hasClass("disabled")||(s.settings.auto&&s.settings.stopAutoOnClick&&o.stopAuto(),o.goToPrevSlide())},M=function(t){o.startAuto(),t.preventDefault()},y=function(t){o.stopAuto(),t.preventDefault()},z=function(e){var i,n;e.preventDefault(),s.controls.el.hasClass("disabled")||(s.settings.auto&&s.settings.stopAutoOnClick&&o.stopAuto(),i=t(e.currentTarget),void 0!==i.attr("data-slide-index")&&(n=parseInt(i.attr("data-slide-index")))!==s.active.index&&o.goToSlide(n))},I=function(e){var i=s.children.length;if("short"===s.settings.pagerType)return s.settings.maxSlides>1&&(i=Math.ceil(s.children.length/s.settings.maxSlides)),void s.pagerEl.html(e+1+s.settings.pagerShortSeparator+i);s.pagerEl.find("a").removeClass("active"),s.pagerEl.each(function(i,n){t(n).find("a").eq(e).addClass("active")})},A=function(){if(s.settings.infiniteLoop){var t="";0===s.active.index?t=s.children.eq(0).position():s.active.index===f()-1&&s.carousel?t=s.children.eq((f()-1)*x()).position():s.active.index===s.children.length-1&&(t=s.children.eq(s.children.length-1).position()),t&&("horizontal"===s.settings.mode?S(-t.left,"reset",0):"vertical"===s.settings.mode&&S(-t.top,"reset",0))}s.working=!1,s.settings.onSlideAfter.call(o,s.children.eq(s.active.index),s.oldIndex,s.active.index)},q=function(t){s.settings.autoControlsCombine?s.controls.autoEl.html(s.controls[t]):(s.controls.autoEl.find("a").removeClass("active"),s.controls.autoEl.find("a:not(.bx-"+t+")").addClass("active"))},D=function(){1===f()?(s.controls.prev.addClass("disabled"),s.controls.next.addClass("disabled")):!s.settings.infiniteLoop&&s.settings.hideControlOnEnd&&(0===s.active.index?(s.controls.prev.addClass("disabled"),s.controls.next.removeClass("disabled")):s.active.index===f()-1?(s.controls.next.addClass("disabled"),s.controls.prev.removeClass("disabled")):(s.controls.prev.removeClass("disabled"),s.controls.next.removeClass("disabled")))},H=function(){o.startAuto()},W=function(){o.stopAuto()},L=function(){if(s.settings.autoDelay>0){setTimeout(o.startAuto,s.settings.autoDelay)}else o.startAuto(),t(window).focus(H).blur(W);s.settings.autoHover&&o.hover(function(){s.interval&&(o.stopAuto(!0),s.autoPaused=!0)},function(){s.autoPaused&&(o.startAuto(!0),s.autoPaused=null)})},O=function(){var e,i,n,r,a,l,d,c,g=0;"next"===s.settings.autoDirection?o.append(s.children.clone().addClass("bx-clone")):(o.prepend(s.children.clone().addClass("bx-clone")),e=s.children.first().position(),g="horizontal"===s.settings.mode?-e.left:-e.top),S(g,"reset",0),s.settings.pager=!1,s.settings.controls=!1,s.settings.autoControls=!1,s.settings.tickerHover&&(s.usingCSS?(r="horizontal"===s.settings.mode?4:5,s.viewport.hover(function(){i=o.css("-"+s.cssPrefix+"-transform"),n=parseFloat(i.split(",")[r]),S(n,"reset",0)},function(){c=0,s.children.each(function(e){c+="horizontal"===s.settings.mode?t(this).outerWidth(!0):t(this).outerHeight(!0)}),a=s.settings.speed/c,l="horizontal"===s.settings.mode?"left":"top",d=a*(c-Math.abs(parseInt(n))),F(d)})):s.viewport.hover(function(){o.stop()},function(){c=0,s.children.each(function(e){c+="horizontal"===s.settings.mode?t(this).outerWidth(!0):t(this).outerHeight(!0)}),a=s.settings.speed/c,l="horizontal"===s.settings.mode?"left":"top",d=a*(c-Math.abs(parseInt(o.css(l)))),F(d)})),F()},F=function(t){var e,i,n,r=t?t:s.settings.speed,a={left:0,top:0},l={left:0,top:0};"next"===s.settings.autoDirection?a=o.find(".bx-clone").first().position():l=s.children.first().position(),e="horizontal"===s.settings.mode?-a.left:-a.top,i="horizontal"===s.settings.mode?-l.left:-l.top,n={resetValue:i},S(e,"ticker",r,n)},N=function(e){var i=t(window),n={top:i.scrollTop(),left:i.scrollLeft()},s=e.offset();return n.right=n.left+i.width(),n.bottom=n.top+i.height(),s.right=s.left+e.outerWidth(),s.bottom=s.top+e.outerHeight(),!(n.right<s.left||n.left>s.right||n.bottom<s.top||n.top>s.bottom)},X=function(t){var e=document.activeElement.tagName.toLowerCase();if(null==new RegExp(e,["i"]).exec("input|textarea")&&N(o)){if(39===t.keyCode)return k(t),!1;if(37===t.keyCode)return E(t),!1}},Y=function(){s.touch={start:{x:0,y:0},end:{x:0,y:0}},s.viewport.bind("touchstart MSPointerDown pointerdown",V),s.viewport.on("click",".bxslider a",function(t){s.viewport.hasClass("click-disabled")&&(t.preventDefault(),s.viewport.removeClass("click-disabled"))})},V=function(t){if(s.controls.el.addClass("disabled"),s.working)t.preventDefault(),s.controls.el.removeClass("disabled");else{s.touch.originalPos=o.position();var e=t.originalEvent,i=void 0!==e.changedTouches?e.changedTouches:[e];s.touch.start.x=i[0].pageX,s.touch.start.y=i[0].pageY,s.viewport.get(0).setPointerCapture&&(s.pointerId=e.pointerId,s.viewport.get(0).setPointerCapture(s.pointerId)),s.viewport.bind("touchmove MSPointerMove pointermove",Z),s.viewport.bind("touchend MSPointerUp pointerup",B),s.viewport.bind("MSPointerCancel pointercancel",R)}},R=function(t){S(s.touch.originalPos.left,"reset",0),s.controls.el.removeClass("disabled"),s.viewport.unbind("MSPointerCancel pointercancel",R),s.viewport.unbind("touchmove MSPointerMove pointermove",Z),s.viewport.unbind("touchend MSPointerUp pointerup",B),s.viewport.get(0).releasePointerCapture&&s.viewport.get(0).releasePointerCapture(s.pointerId)},Z=function(t){var e=t.originalEvent,i=void 0!==e.changedTouches?e.changedTouches:[e],n=Math.abs(i[0].pageX-s.touch.start.x),o=Math.abs(i[0].pageY-s.touch.start.y),r=0,a=0;3*n>o&&s.settings.preventDefaultSwipeX?t.preventDefault():3*o>n&&s.settings.preventDefaultSwipeY&&t.preventDefault(),"fade"!==s.settings.mode&&s.settings.oneToOneTouch&&("horizontal"===s.settings.mode?(a=i[0].pageX-s.touch.start.x,r=s.touch.originalPos.left+a):(a=i[0].pageY-s.touch.start.y,r=s.touch.originalPos.top+a),S(r,"reset",0))},B=function(t){s.viewport.unbind("touchmove MSPointerMove pointermove",Z),s.controls.el.removeClass("disabled");var e=t.originalEvent,i=void 0!==e.changedTouches?e.changedTouches:[e],n=0,r=0;s.touch.end.x=i[0].pageX,s.touch.end.y=i[0].pageY,"fade"===s.settings.mode?(r=Math.abs(s.touch.start.x-s.touch.end.x))>=s.settings.swipeThreshold&&(s.touch.start.x>s.touch.end.x?o.goToNextSlide():o.goToPrevSlide(),o.stopAuto()):("horizontal"===s.settings.mode?(r=s.touch.end.x-s.touch.start.x,n=s.touch.originalPos.left):(r=s.touch.end.y-s.touch.start.y,n=s.touch.originalPos.top),!s.settings.infiniteLoop&&(0===s.active.index&&r>0||s.active.last&&r<0)?S(n,"reset",200):Math.abs(r)>=s.settings.swipeThreshold?(r<0?o.goToNextSlide():o.goToPrevSlide(),o.stopAuto()):S(n,"reset",200)),s.viewport.unbind("touchend MSPointerUp pointerup",B),s.viewport.get(0).releasePointerCapture&&s.viewport.get(0).releasePointerCapture(s.pointerId)},U=function(e){if(s.initialized)if(s.working)window.setTimeout(U,10);else{var i=t(window).width(),n=t(window).height();r===i&&a===n||(r=i,a=n,o.redrawSlider(),s.settings.onSliderResize.call(o,s.active.index))}},j=function(t){var e=v();s.settings.ariaHidden&&!s.settings.ticker&&(s.children.attr("aria-hidden","true"),s.children.slice(t,t+e).attr("aria-hidden","false"))},Q=function(t){return t<0?s.settings.infiniteLoop?f()-1:s.active.index:t>=f()?s.settings.infiniteLoop?0:s.active.index:t};return o.goToSlide=function(e,i){var n,r,a,l,d=!0,c=0,g={left:0,top:0},u=null;if(s.oldIndex=s.active.index,s.active.index=Q(e),!s.working&&s.active.index!==s.oldIndex){if(s.working=!0,void 0!==(d=s.settings.onSlideBefore.call(o,s.children.eq(s.active.index),s.oldIndex,s.active.index))&&!d)return s.active.index=s.oldIndex,void(s.working=!1);"next"===i?s.settings.onSlideNext.call(o,s.children.eq(s.active.index),s.oldIndex,s.active.index)||(d=!1):"prev"===i&&(s.settings.onSlidePrev.call(o,s.children.eq(s.active.index),s.oldIndex,s.active.index)||(d=!1)),s.active.last=s.active.index>=f()-1,(s.settings.pager||s.settings.pagerCustom)&&I(s.active.index),s.settings.controls&&D(),"fade"===s.settings.mode?(s.settings.adaptiveHeight&&s.viewport.height()!==p()&&s.viewport.animate({height:p()},s.settings.adaptiveHeightSpeed),s.children.filter(":visible").fadeOut(s.settings.speed).css({zIndex:0}),s.children.eq(s.active.index).css("zIndex",s.settings.slideZIndex+1).fadeIn(s.settings.speed,function(){t(this).css("zIndex",s.settings.slideZIndex),A()})):(s.settings.adaptiveHeight&&s.viewport.height()!==p()&&s.viewport.animate({height:p()},s.settings.adaptiveHeightSpeed),!s.settings.infiniteLoop&&s.carousel&&s.active.last?"horizontal"===s.settings.mode?(u=s.children.eq(s.children.length-1),g=u.position(),c=s.viewport.width()-u.outerWidth()):(n=s.children.length-s.settings.minSlides,g=s.children.eq(n).position()):s.carousel&&s.active.last&&"prev"===i?(r=1===s.settings.moveSlides?s.settings.maxSlides-x():(f()-1)*x()-(s.children.length-s.settings.maxSlides),u=o.children(".bx-clone").eq(r),g=u.position()):"next"===i&&0===s.active.index?(g=o.find("> .bx-clone").eq(s.settings.maxSlides).position(),s.active.last=!1):e>=0&&(l=e*parseInt(x()),g=s.children.eq(l).position()),void 0!==g&&(a="horizontal"===s.settings.mode?-(g.left-c):-g.top,S(a,"slide",s.settings.speed)),s.working=!1),s.settings.ariaHidden&&j(s.active.index*x())}},o.goToNextSlide=function(){if((s.settings.infiniteLoop||!s.active.last)&&1!=s.working){var t=parseInt(s.active.index)+1;o.goToSlide(t,"next")}},o.goToPrevSlide=function(){if((s.settings.infiniteLoop||0!==s.active.index)&&1!=s.working){var t=parseInt(s.active.index)-1;o.goToSlide(t,"prev")}},o.startAuto=function(t){s.interval||(s.interval=setInterval(function(){"next"===s.settings.autoDirection?o.goToNextSlide():o.goToPrevSlide()},s.settings.pause),s.settings.onAutoChange.call(o,!0),s.settings.autoControls&&t!==!0&&q("stop"))},o.stopAuto=function(t){s.interval&&(clearInterval(s.interval),s.interval=null,s.settings.onAutoChange.call(o,!1),s.settings.autoControls&&t!==!0&&q("start"))},o.getCurrentSlide=function(){return s.active.index},o.getCurrentSlideElement=function(){return s.children.eq(s.active.index)},o.getSlideElement=function(t){return s.children.eq(t)},o.getSlideCount=function(){return s.children.length},o.isWorking=function(){return s.working},o.redrawSlider=function(){s.children.add(o.find(".bx-clone")).outerWidth(h()),s.viewport.css("height",p()),s.settings.ticker||m(),s.active.last&&(s.active.index=f()-1),s.active.index>=f()&&(s.active.last=!0),s.settings.pager&&!s.settings.pagerCustom&&(b(),I(s.active.index)),s.settings.ariaHidden&&j(s.active.index*x())},o.destroySlider=function(){s.initialized&&(s.initialized=!1,t(".bx-clone",this).remove(),s.children.each(function(){void 0!==t(this).data("origStyle")?t(this).attr("style",t(this).data("origStyle")):t(this).removeAttr("style")}),void 0!==t(this).data("origStyle")?this.attr("style",t(this).data("origStyle")):t(this).removeAttr("style"),t(this).unwrap().unwrap(),s.controls.el&&s.controls.el.remove(),s.controls.next&&s.controls.next.remove(),s.controls.prev&&s.controls.prev.remove(),s.pagerEl&&s.settings.controls&&!s.settings.pagerCustom&&s.pagerEl.remove(),t(".bx-caption",this).remove(),s.controls.autoEl&&s.controls.autoEl.remove(),clearInterval(s.interval),s.settings.responsive&&t(window).unbind("resize",U),s.settings.keyboardEnabled&&t(document).unbind("keydown",X),t(this).removeData("bxSlider"),t(window).off("blur",W).off("focus",H))},o.reloadSlider=function(e){void 0!==e&&(n=e),o.destroySlider(),l(),t(o).data("bxSlider",this)},l(),t(o).data("bxSlider",this),this}}}(jQuery);
define("bxslider", function(){});

/* jQuery elevateZoom 3.0.8 - Demo's and documentation: - www.elevateweb.co.uk/image-zoom - Copyright (c) 2013 Andrew Eades - www.elevateweb.co.uk - Dual licensed under the LGPL licenses. - http://en.wikipedia.org/wiki/MIT_License - http://en.wikipedia.org/wiki/GNU_General_Public_License */
"function"!==typeof Object.create&&(Object.create=function(d){function h(){}h.prototype=d;return new h});
(function(d,h,l,m){var k={init:function(b,a){var c=this;c.elem=a;c.$elem=d(a);c.imageSrc=c.$elem.data("zoom-image")?c.$elem.data("zoom-image"):c.$elem.attr("src");c.options=d.extend({},d.fn.elevateZoom.options,b);c.options.tint&&(c.options.lensColour="none",c.options.lensOpacity="1");"inner"==c.options.zoomType&&(c.options.showLens=!1);c.$elem.parent().removeAttr("title").removeAttr("alt");c.zoomImage=c.imageSrc;c.refresh(1);d("#"+c.options.gallery+" a").click(function(a){c.options.galleryActiveClass&&
(d("#"+c.options.gallery+" a").removeClass(c.options.galleryActiveClass),d(this).addClass(c.options.galleryActiveClass));a.preventDefault();d(this).data("zoom-image")?c.zoomImagePre=d(this).data("zoom-image"):c.zoomImagePre=d(this).data("image");c.swaptheimage(d(this).data("image"),c.zoomImagePre);return!1})},refresh:function(b){var a=this;setTimeout(function(){a.fetch(a.imageSrc)},b||a.options.refresh)},fetch:function(b){var a=this,c=new Image;c.onload=function(){a.largeWidth=c.width;a.largeHeight=
c.height;a.startZoom();a.currentImage=a.imageSrc;a.options.onZoomedImageLoaded(a.$elem)};c.src=b},startZoom:function(){var b=this;b.nzWidth=b.$elem.width();b.nzHeight=b.$elem.height();b.isWindowActive=!1;b.isLensActive=!1;b.isTintActive=!1;b.overWindow=!1;b.options.imageCrossfade&&(b.zoomWrap=b.$elem.wrap('<div style="height:'+b.nzHeight+"px;width:"+b.nzWidth+'px;" class="zoomWrapper" />'),b.$elem.css("position","absolute"));b.zoomLock=1;b.scrollingLock=!1;b.changeBgSize=!1;b.currentZoomLevel=b.options.zoomLevel;
b.nzOffset=b.$elem.offset();b.widthRatio=b.largeWidth/b.currentZoomLevel/b.nzWidth;b.heightRatio=b.largeHeight/b.currentZoomLevel/b.nzHeight;"window"==b.options.zoomType&&(b.zoomWindowStyle="overflow: hidden;background-position: 0px 0px;text-align:center;background-color: "+String(b.options.zoomWindowBgColour)+";width: "+String(b.options.zoomWindowWidth)+"px;height: "+String(b.options.zoomWindowHeight)+"px;float: left;background-size: "+b.largeWidth/b.currentZoomLevel+"px "+b.largeHeight/b.currentZoomLevel+
"px;display: none;z-index:100;border: "+String(b.options.borderSize)+"px solid "+b.options.borderColour+";background-repeat: no-repeat;position: absolute;");if("inner"==b.options.zoomType){var a=b.$elem.css("border-left-width");b.zoomWindowStyle="overflow: hidden;margin-left: "+String(a)+";margin-top: "+String(a)+";background-position: 0px 0px;width: "+String(b.nzWidth)+"px;height: "+String(b.nzHeight)+"px;float: left;display: none;cursor:"+b.options.cursor+";px solid "+b.options.borderColour+";background-repeat: no-repeat;position: absolute;"}"window"==
b.options.zoomType&&(lensHeight=b.nzHeight<b.options.zoomWindowWidth/b.widthRatio?b.nzHeight:String(b.options.zoomWindowHeight/b.heightRatio),lensWidth=b.largeWidth<b.options.zoomWindowWidth?b.nzWidth:b.options.zoomWindowWidth/b.widthRatio,b.lensStyle="background-position: 0px 0px;width: "+String(b.options.zoomWindowWidth/b.widthRatio)+"px;height: "+String(b.options.zoomWindowHeight/b.heightRatio)+"px;float: right;display: none;overflow: hidden;z-index: 999;-webkit-transform: translateZ(0);opacity:"+
b.options.lensOpacity+";filter: alpha(opacity = "+100*b.options.lensOpacity+"); zoom:1;width:"+lensWidth+"px;height:"+lensHeight+"px;background-color:"+b.options.lensColour+";cursor:"+b.options.cursor+";border: "+b.options.lensBorderSize+"px solid "+b.options.lensBorderColour+";background-repeat: no-repeat;position: absolute;");b.tintStyle="display: block;position: absolute;background-color: "+b.options.tintColour+";filter:alpha(opacity=0);opacity: 0;width: "+b.nzWidth+"px;height: "+b.nzHeight+"px;";
b.lensRound="";"lens"==b.options.zoomType&&(b.lensStyle="background-position: 0px 0px;float: left;display: none;border: "+String(b.options.borderSize)+"px solid "+b.options.borderColour+";width:"+String(b.options.lensSize)+"px;height:"+String(b.options.lensSize)+"px;background-repeat: no-repeat;position: absolute;");"round"==b.options.lensShape&&(b.lensRound="border-top-left-radius: "+String(b.options.lensSize/2+b.options.borderSize)+"px;border-top-right-radius: "+String(b.options.lensSize/2+b.options.borderSize)+
"px;border-bottom-left-radius: "+String(b.options.lensSize/2+b.options.borderSize)+"px;border-bottom-right-radius: "+String(b.options.lensSize/2+b.options.borderSize)+"px;");b.zoomContainer=d('<div class="zoomContainer" style="-webkit-transform: translateZ(0);position:absolute;left:'+b.nzOffset.left+"px;top:"+b.nzOffset.top+"px;height:"+b.nzHeight+"px;width:"+b.nzWidth+'px;"></div>');d("body").append(b.zoomContainer);b.options.containLensZoom&&"lens"==b.options.zoomType&&b.zoomContainer.css("overflow",
"hidden");"inner"!=b.options.zoomType&&(b.zoomLens=d("<div class='zoomLens' style='"+b.lensStyle+b.lensRound+"'>&nbsp;</div>").appendTo(b.zoomContainer).click(function(){b.$elem.trigger("click")}),b.options.tint&&(b.tintContainer=d("<div/>").addClass("tintContainer"),b.zoomTint=d("<div class='zoomTint' style='"+b.tintStyle+"'></div>"),b.zoomLens.wrap(b.tintContainer),b.zoomTintcss=b.zoomLens.after(b.zoomTint),b.zoomTintImage=d('<img style="position: absolute; left: 0px; top: 0px; max-width: none; width: '+
b.nzWidth+"px; height: "+b.nzHeight+'px;" src="'+b.imageSrc+'">').appendTo(b.zoomLens).click(function(){b.$elem.trigger("click")})));isNaN(b.options.zoomWindowPosition)?b.zoomWindow=d("<div style='z-index:999;left:"+b.windowOffsetLeft+"px;top:"+b.windowOffsetTop+"px;"+b.zoomWindowStyle+"' class='zoomWindow'>&nbsp;</div>").appendTo("body").click(function(){b.$elem.trigger("click")}):b.zoomWindow=d("<div style='z-index:999;left:"+b.windowOffsetLeft+"px;top:"+b.windowOffsetTop+"px;"+b.zoomWindowStyle+
"' class='zoomWindow'>&nbsp;</div>").appendTo(b.zoomContainer).click(function(){b.$elem.trigger("click")});b.zoomWindowContainer=d("<div/>").addClass("zoomWindowContainer").css("width",b.options.zoomWindowWidth);b.zoomWindow.wrap(b.zoomWindowContainer);"lens"==b.options.zoomType&&b.zoomLens.css({backgroundImage:"url('"+b.imageSrc+"')"});"window"==b.options.zoomType&&b.zoomWindow.css({backgroundImage:"url('"+b.imageSrc+"')"});"inner"==b.options.zoomType&&b.zoomWindow.css({backgroundImage:"url('"+b.imageSrc+
"')"});b.$elem.bind("touchmove",function(a){a.preventDefault();b.setPosition(a.originalEvent.touches[0]||a.originalEvent.changedTouches[0])});b.zoomContainer.bind("touchmove",function(a){"inner"==b.options.zoomType&&b.showHideWindow("show");a.preventDefault();b.setPosition(a.originalEvent.touches[0]||a.originalEvent.changedTouches[0])});b.zoomContainer.bind("touchend",function(a){b.showHideWindow("hide");b.options.showLens&&b.showHideLens("hide");b.options.tint&&"inner"!=b.options.zoomType&&b.showHideTint("hide")});
b.$elem.bind("touchend",function(a){b.showHideWindow("hide");b.options.showLens&&b.showHideLens("hide");b.options.tint&&"inner"!=b.options.zoomType&&b.showHideTint("hide")});b.options.showLens&&(b.zoomLens.bind("touchmove",function(a){a.preventDefault();b.setPosition(a.originalEvent.touches[0]||a.originalEvent.changedTouches[0])}),b.zoomLens.bind("touchend",function(a){b.showHideWindow("hide");b.options.showLens&&b.showHideLens("hide");b.options.tint&&"inner"!=b.options.zoomType&&b.showHideTint("hide")}));
b.$elem.bind("mousemove",function(a){!1==b.overWindow&&b.setElements("show");if(b.lastX!==a.clientX||b.lastY!==a.clientY)b.setPosition(a),b.currentLoc=a;b.lastX=a.clientX;b.lastY=a.clientY});b.zoomContainer.bind("mousemove",function(a){!1==b.overWindow&&b.setElements("show");if(b.lastX!==a.clientX||b.lastY!==a.clientY)b.setPosition(a),b.currentLoc=a;b.lastX=a.clientX;b.lastY=a.clientY});"inner"!=b.options.zoomType&&b.zoomLens.bind("mousemove",function(a){if(b.lastX!==a.clientX||b.lastY!==a.clientY)b.setPosition(a),
b.currentLoc=a;b.lastX=a.clientX;b.lastY=a.clientY});b.options.tint&&"inner"!=b.options.zoomType&&b.zoomTint.bind("mousemove",function(a){if(b.lastX!==a.clientX||b.lastY!==a.clientY)b.setPosition(a),b.currentLoc=a;b.lastX=a.clientX;b.lastY=a.clientY});"inner"==b.options.zoomType&&b.zoomWindow.bind("mousemove",function(a){if(b.lastX!==a.clientX||b.lastY!==a.clientY)b.setPosition(a),b.currentLoc=a;b.lastX=a.clientX;b.lastY=a.clientY});b.zoomContainer.add(b.$elem).mouseenter(function(){!1==b.overWindow&&
b.setElements("show")}).mouseleave(function(){b.scrollLock||b.setElements("hide")});"inner"!=b.options.zoomType&&b.zoomWindow.mouseenter(function(){b.overWindow=!0;b.setElements("hide")}).mouseleave(function(){b.overWindow=!1});b.minZoomLevel=b.options.minZoomLevel?b.options.minZoomLevel:2*b.options.scrollZoomIncrement;b.options.scrollZoom&&b.zoomContainer.add(b.$elem).bind("mousewheel DOMMouseScroll MozMousePixelScroll",function(a){b.scrollLock=!0;clearTimeout(d.data(this,"timer"));d.data(this,"timer",
setTimeout(function(){b.scrollLock=!1},250));var e=a.originalEvent.wheelDelta||-1*a.originalEvent.detail;a.stopImmediatePropagation();a.stopPropagation();a.preventDefault();0<e/120?b.currentZoomLevel>=b.minZoomLevel&&b.changeZoomLevel(b.currentZoomLevel-b.options.scrollZoomIncrement):b.options.maxZoomLevel?b.currentZoomLevel<=b.options.maxZoomLevel&&b.changeZoomLevel(parseFloat(b.currentZoomLevel)+b.options.scrollZoomIncrement):b.changeZoomLevel(parseFloat(b.currentZoomLevel)+b.options.scrollZoomIncrement);
return!1})},setElements:function(b){if(!this.options.zoomEnabled)return!1;"show"==b&&this.isWindowSet&&("inner"==this.options.zoomType&&this.showHideWindow("show"),"window"==this.options.zoomType&&this.showHideWindow("show"),this.options.showLens&&this.showHideLens("show"),this.options.tint&&"inner"!=this.options.zoomType&&this.showHideTint("show"));"hide"==b&&("window"==this.options.zoomType&&this.showHideWindow("hide"),this.options.tint||this.showHideWindow("hide"),this.options.showLens&&this.showHideLens("hide"),
this.options.tint&&this.showHideTint("hide"))},setPosition:function(b){if(!this.options.zoomEnabled)return!1;this.nzHeight=this.$elem.height();this.nzWidth=this.$elem.width();this.nzOffset=this.$elem.offset();this.options.tint&&"inner"!=this.options.zoomType&&(this.zoomTint.css({top:0}),this.zoomTint.css({left:0}));this.options.responsive&&!this.options.scrollZoom&&this.options.showLens&&(lensHeight=this.nzHeight<this.options.zoomWindowWidth/this.widthRatio?this.nzHeight:String(this.options.zoomWindowHeight/
this.heightRatio),lensWidth=this.largeWidth<this.options.zoomWindowWidth?this.nzWidth:this.options.zoomWindowWidth/this.widthRatio,this.widthRatio=this.largeWidth/this.nzWidth,this.heightRatio=this.largeHeight/this.nzHeight,"lens"!=this.options.zoomType&&(lensHeight=this.nzHeight<this.options.zoomWindowWidth/this.widthRatio?this.nzHeight:String(this.options.zoomWindowHeight/this.heightRatio),lensWidth=this.options.zoomWindowWidth<this.options.zoomWindowWidth?this.nzWidth:this.options.zoomWindowWidth/
this.widthRatio,this.zoomLens.css("width",lensWidth),this.zoomLens.css("height",lensHeight),this.options.tint&&(this.zoomTintImage.css("width",this.nzWidth),this.zoomTintImage.css("height",this.nzHeight))),"lens"==this.options.zoomType&&this.zoomLens.css({width:String(this.options.lensSize)+"px",height:String(this.options.lensSize)+"px"}));this.zoomContainer.css({top:this.nzOffset.top});this.zoomContainer.css({left:this.nzOffset.left});this.mouseLeft=parseInt(b.pageX-this.nzOffset.left);this.mouseTop=
parseInt(b.pageY-this.nzOffset.top);"window"==this.options.zoomType&&(this.Etoppos=this.mouseTop<this.zoomLens.height()/2,this.Eboppos=this.mouseTop>this.nzHeight-this.zoomLens.height()/2-2*this.options.lensBorderSize,this.Eloppos=this.mouseLeft<0+this.zoomLens.width()/2,this.Eroppos=this.mouseLeft>this.nzWidth-this.zoomLens.width()/2-2*this.options.lensBorderSize);"inner"==this.options.zoomType&&(this.Etoppos=this.mouseTop<this.nzHeight/2/this.heightRatio,this.Eboppos=this.mouseTop>this.nzHeight-
this.nzHeight/2/this.heightRatio,this.Eloppos=this.mouseLeft<0+this.nzWidth/2/this.widthRatio,this.Eroppos=this.mouseLeft>this.nzWidth-this.nzWidth/2/this.widthRatio-2*this.options.lensBorderSize);0>=this.mouseLeft||0>this.mouseTop||this.mouseLeft>this.nzWidth||this.mouseTop>this.nzHeight?this.setElements("hide"):(this.options.showLens&&(this.lensLeftPos=String(this.mouseLeft-this.zoomLens.width()/2),this.lensTopPos=String(this.mouseTop-this.zoomLens.height()/2)),this.Etoppos&&(this.lensTopPos=0),
this.Eloppos&&(this.tintpos=this.lensLeftPos=this.windowLeftPos=0),"window"==this.options.zoomType&&(this.Eboppos&&(this.lensTopPos=Math.max(this.nzHeight-this.zoomLens.height()-2*this.options.lensBorderSize,0)),this.Eroppos&&(this.lensLeftPos=this.nzWidth-this.zoomLens.width()-2*this.options.lensBorderSize)),"inner"==this.options.zoomType&&(this.Eboppos&&(this.lensTopPos=Math.max(this.nzHeight-2*this.options.lensBorderSize,0)),this.Eroppos&&(this.lensLeftPos=this.nzWidth-this.nzWidth-2*this.options.lensBorderSize)),
"lens"==this.options.zoomType&&(this.windowLeftPos=String(-1*((b.pageX-this.nzOffset.left)*this.widthRatio-this.zoomLens.width()/2)),this.windowTopPos=String(-1*((b.pageY-this.nzOffset.top)*this.heightRatio-this.zoomLens.height()/2)),this.zoomLens.css({backgroundPosition:this.windowLeftPos+"px "+this.windowTopPos+"px"}),this.changeBgSize&&(this.nzHeight>this.nzWidth?("lens"==this.options.zoomType&&this.zoomLens.css({"background-size":this.largeWidth/this.newvalueheight+"px "+this.largeHeight/this.newvalueheight+
"px"}),this.zoomWindow.css({"background-size":this.largeWidth/this.newvalueheight+"px "+this.largeHeight/this.newvalueheight+"px"})):("lens"==this.options.zoomType&&this.zoomLens.css({"background-size":this.largeWidth/this.newvaluewidth+"px "+this.largeHeight/this.newvaluewidth+"px"}),this.zoomWindow.css({"background-size":this.largeWidth/this.newvaluewidth+"px "+this.largeHeight/this.newvaluewidth+"px"})),this.changeBgSize=!1),this.setWindowPostition(b)),this.options.tint&&"inner"!=this.options.zoomType&&
this.setTintPosition(b),"window"==this.options.zoomType&&this.setWindowPostition(b),"inner"==this.options.zoomType&&this.setWindowPostition(b),this.options.showLens&&(this.fullwidth&&"lens"!=this.options.zoomType&&(this.lensLeftPos=0),this.zoomLens.css({left:this.lensLeftPos+"px",top:this.lensTopPos+"px"})))},showHideWindow:function(b){"show"!=b||this.isWindowActive||(this.options.zoomWindowFadeIn?this.zoomWindow.stop(!0,!0,!1).fadeIn(this.options.zoomWindowFadeIn):this.zoomWindow.show(),this.isWindowActive=
!0);"hide"==b&&this.isWindowActive&&(this.options.zoomWindowFadeOut?this.zoomWindow.stop(!0,!0).fadeOut(this.options.zoomWindowFadeOut):this.zoomWindow.hide(),this.isWindowActive=!1)},showHideLens:function(b){"show"!=b||this.isLensActive||(this.options.lensFadeIn?this.zoomLens.stop(!0,!0,!1).fadeIn(this.options.lensFadeIn):this.zoomLens.show(),this.isLensActive=!0);"hide"==b&&this.isLensActive&&(this.options.lensFadeOut?this.zoomLens.stop(!0,!0).fadeOut(this.options.lensFadeOut):this.zoomLens.hide(),
this.isLensActive=!1)},showHideTint:function(b){"show"!=b||this.isTintActive||(this.options.zoomTintFadeIn?this.zoomTint.css({opacity:this.options.tintOpacity}).animate().stop(!0,!0).fadeIn("slow"):(this.zoomTint.css({opacity:this.options.tintOpacity}).animate(),this.zoomTint.show()),this.isTintActive=!0);"hide"==b&&this.isTintActive&&(this.options.zoomTintFadeOut?this.zoomTint.stop(!0,!0).fadeOut(this.options.zoomTintFadeOut):this.zoomTint.hide(),this.isTintActive=!1)},setLensPostition:function(b){},
setWindowPostition:function(b){var a=this;if(isNaN(a.options.zoomWindowPosition))a.externalContainer=d("#"+a.options.zoomWindowPosition),a.externalContainerWidth=a.externalContainer.width(),a.externalContainerHeight=a.externalContainer.height(),a.externalContainerOffset=a.externalContainer.offset(),a.windowOffsetTop=a.externalContainerOffset.top,a.windowOffsetLeft=a.externalContainerOffset.left;else switch(a.options.zoomWindowPosition){case 1:a.windowOffsetTop=a.options.zoomWindowOffety;a.windowOffsetLeft=
+a.nzWidth;break;case 2:a.options.zoomWindowHeight>a.nzHeight&&(a.windowOffsetTop=-1*(a.options.zoomWindowHeight/2-a.nzHeight/2),a.windowOffsetLeft=a.nzWidth);break;case 3:a.windowOffsetTop=a.nzHeight-a.zoomWindow.height()-2*a.options.borderSize;a.windowOffsetLeft=a.nzWidth;break;case 4:a.windowOffsetTop=a.nzHeight;a.windowOffsetLeft=a.nzWidth;break;case 5:a.windowOffsetTop=a.nzHeight;a.windowOffsetLeft=a.nzWidth-a.zoomWindow.width()-2*a.options.borderSize;break;case 6:a.options.zoomWindowHeight>
a.nzHeight&&(a.windowOffsetTop=a.nzHeight,a.windowOffsetLeft=-1*(a.options.zoomWindowWidth/2-a.nzWidth/2+2*a.options.borderSize));break;case 7:a.windowOffsetTop=a.nzHeight;a.windowOffsetLeft=0;break;case 8:a.windowOffsetTop=a.nzHeight;a.windowOffsetLeft=-1*(a.zoomWindow.width()+2*a.options.borderSize);break;case 9:a.windowOffsetTop=a.nzHeight-a.zoomWindow.height()-2*a.options.borderSize;a.windowOffsetLeft=-1*(a.zoomWindow.width()+2*a.options.borderSize);break;case 10:a.options.zoomWindowHeight>a.nzHeight&&
(a.windowOffsetTop=-1*(a.options.zoomWindowHeight/2-a.nzHeight/2),a.windowOffsetLeft=-1*(a.zoomWindow.width()+2*a.options.borderSize));break;case 11:a.windowOffsetTop=a.options.zoomWindowOffety;a.windowOffsetLeft=-1*(a.zoomWindow.width()+2*a.options.borderSize);break;case 12:a.windowOffsetTop=-1*(a.zoomWindow.height()+2*a.options.borderSize);a.windowOffsetLeft=-1*(a.zoomWindow.width()+2*a.options.borderSize);break;case 13:a.windowOffsetTop=-1*(a.zoomWindow.height()+2*a.options.borderSize);a.windowOffsetLeft=
0;break;case 14:a.options.zoomWindowHeight>a.nzHeight&&(a.windowOffsetTop=-1*(a.zoomWindow.height()+2*a.options.borderSize),a.windowOffsetLeft=-1*(a.options.zoomWindowWidth/2-a.nzWidth/2+2*a.options.borderSize));break;case 15:a.windowOffsetTop=-1*(a.zoomWindow.height()+2*a.options.borderSize);a.windowOffsetLeft=a.nzWidth-a.zoomWindow.width()-2*a.options.borderSize;break;case 16:a.windowOffsetTop=-1*(a.zoomWindow.height()+2*a.options.borderSize);a.windowOffsetLeft=a.nzWidth;break;default:a.windowOffsetTop=
a.options.zoomWindowOffety,a.windowOffsetLeft=a.nzWidth}a.isWindowSet=!0;a.windowOffsetTop+=a.options.zoomWindowOffety;a.windowOffsetLeft+=a.options.zoomWindowOffetx;a.zoomWindow.css({top:a.windowOffsetTop});a.zoomWindow.css({left:a.windowOffsetLeft});"inner"==a.options.zoomType&&(a.zoomWindow.css({top:0}),a.zoomWindow.css({left:0}));a.windowLeftPos=String(-1*((b.pageX-a.nzOffset.left)*a.widthRatio-a.zoomWindow.width()/2));a.windowTopPos=String(-1*((b.pageY-a.nzOffset.top)*a.heightRatio-a.zoomWindow.height()/
2));a.Etoppos&&(a.windowTopPos=0);a.Eloppos&&(a.windowLeftPos=0);a.Eboppos&&(a.windowTopPos=-1*(a.largeHeight/a.currentZoomLevel-a.zoomWindow.height()));a.Eroppos&&(a.windowLeftPos=-1*(a.largeWidth/a.currentZoomLevel-a.zoomWindow.width()));a.fullheight&&(a.windowTopPos=0);a.fullwidth&&(a.windowLeftPos=0);if("window"==a.options.zoomType||"inner"==a.options.zoomType)1==a.zoomLock&&(1>=a.widthRatio&&(a.windowLeftPos=0),1>=a.heightRatio&&(a.windowTopPos=0)),a.largeHeight<a.options.zoomWindowHeight&&(a.windowTopPos=
0),a.largeWidth<a.options.zoomWindowWidth&&(a.windowLeftPos=0),a.options.easing?(a.xp||(a.xp=0),a.yp||(a.yp=0),a.loop||(a.loop=setInterval(function(){a.xp+=(a.windowLeftPos-a.xp)/a.options.easingAmount;a.yp+=(a.windowTopPos-a.yp)/a.options.easingAmount;a.scrollingLock?(clearInterval(a.loop),a.xp=a.windowLeftPos,a.yp=a.windowTopPos,a.xp=-1*((b.pageX-a.nzOffset.left)*a.widthRatio-a.zoomWindow.width()/2),a.yp=-1*((b.pageY-a.nzOffset.top)*a.heightRatio-a.zoomWindow.height()/2),a.changeBgSize&&(a.nzHeight>
a.nzWidth?("lens"==a.options.zoomType&&a.zoomLens.css({"background-size":a.largeWidth/a.newvalueheight+"px "+a.largeHeight/a.newvalueheight+"px"}),a.zoomWindow.css({"background-size":a.largeWidth/a.newvalueheight+"px "+a.largeHeight/a.newvalueheight+"px"})):("lens"!=a.options.zoomType&&a.zoomLens.css({"background-size":a.largeWidth/a.newvaluewidth+"px "+a.largeHeight/a.newvalueheight+"px"}),a.zoomWindow.css({"background-size":a.largeWidth/a.newvaluewidth+"px "+a.largeHeight/a.newvaluewidth+"px"})),
a.changeBgSize=!1),a.zoomWindow.css({backgroundPosition:a.windowLeftPos+"px "+a.windowTopPos+"px"}),a.scrollingLock=!1,a.loop=!1):(a.changeBgSize&&(a.nzHeight>a.nzWidth?("lens"==a.options.zoomType&&a.zoomLens.css({"background-size":a.largeWidth/a.newvalueheight+"px "+a.largeHeight/a.newvalueheight+"px"}),a.zoomWindow.css({"background-size":a.largeWidth/a.newvalueheight+"px "+a.largeHeight/a.newvalueheight+"px"})):("lens"!=a.options.zoomType&&a.zoomLens.css({"background-size":a.largeWidth/a.newvaluewidth+
"px "+a.largeHeight/a.newvaluewidth+"px"}),a.zoomWindow.css({"background-size":a.largeWidth/a.newvaluewidth+"px "+a.largeHeight/a.newvaluewidth+"px"})),a.changeBgSize=!1),a.zoomWindow.css({backgroundPosition:a.xp+"px "+a.yp+"px"}))},16))):(a.changeBgSize&&(a.nzHeight>a.nzWidth?("lens"==a.options.zoomType&&a.zoomLens.css({"background-size":a.largeWidth/a.newvalueheight+"px "+a.largeHeight/a.newvalueheight+"px"}),a.zoomWindow.css({"background-size":a.largeWidth/a.newvalueheight+"px "+a.largeHeight/
a.newvalueheight+"px"})):("lens"==a.options.zoomType&&a.zoomLens.css({"background-size":a.largeWidth/a.newvaluewidth+"px "+a.largeHeight/a.newvaluewidth+"px"}),a.largeHeight/a.newvaluewidth<a.options.zoomWindowHeight?a.zoomWindow.css({"background-size":a.largeWidth/a.newvaluewidth+"px "+a.largeHeight/a.newvaluewidth+"px"}):a.zoomWindow.css({"background-size":a.largeWidth/a.newvalueheight+"px "+a.largeHeight/a.newvalueheight+"px"})),a.changeBgSize=!1),a.zoomWindow.css({backgroundPosition:a.windowLeftPos+
"px "+a.windowTopPos+"px"}))},setTintPosition:function(b){this.nzOffset=this.$elem.offset();this.tintpos=String(-1*(b.pageX-this.nzOffset.left-this.zoomLens.width()/2));this.tintposy=String(-1*(b.pageY-this.nzOffset.top-this.zoomLens.height()/2));this.Etoppos&&(this.tintposy=0);this.Eloppos&&(this.tintpos=0);this.Eboppos&&(this.tintposy=-1*(this.nzHeight-this.zoomLens.height()-2*this.options.lensBorderSize));this.Eroppos&&(this.tintpos=-1*(this.nzWidth-this.zoomLens.width()-2*this.options.lensBorderSize));
this.options.tint&&(this.fullheight&&(this.tintposy=0),this.fullwidth&&(this.tintpos=0),this.zoomTintImage.css({left:this.tintpos+"px"}),this.zoomTintImage.css({top:this.tintposy+"px"}))},swaptheimage:function(b,a){var c=this,e=new Image;c.options.loadingIcon&&(c.spinner=d("<div style=\"background: url('"+c.options.loadingIcon+"') no-repeat center;height:"+c.nzHeight+"px;width:"+c.nzWidth+'px;z-index: 2000;position: absolute; background-position: center center;"></div>'),c.$elem.after(c.spinner));
c.options.onImageSwap(c.$elem);e.onload=function(){c.largeWidth=e.width;c.largeHeight=e.height;c.zoomImage=a;c.zoomWindow.css({"background-size":c.largeWidth+"px "+c.largeHeight+"px"});c.zoomWindow.css({"background-size":c.largeWidth+"px "+c.largeHeight+"px"});c.swapAction(b,a)};e.src=a},swapAction:function(b,a){var c=this,e=new Image;e.onload=function(){c.nzHeight=e.height;c.nzWidth=e.width;c.options.onImageSwapComplete(c.$elem);c.doneCallback()};e.src=b;c.currentZoomLevel=c.options.zoomLevel;c.options.maxZoomLevel=
!1;"lens"==c.options.zoomType&&c.zoomLens.css({backgroundImage:"url('"+a+"')"});"window"==c.options.zoomType&&c.zoomWindow.css({backgroundImage:"url('"+a+"')"});"inner"==c.options.zoomType&&c.zoomWindow.css({backgroundImage:"url('"+a+"')"});c.currentImage=a;if(c.options.imageCrossfade){var f=c.$elem,g=f.clone();c.$elem.attr("src",b);c.$elem.after(g);g.stop(!0).fadeOut(c.options.imageCrossfade,function(){d(this).remove()});c.$elem.width("auto").removeAttr("width");c.$elem.height("auto").removeAttr("height");
f.fadeIn(c.options.imageCrossfade);c.options.tint&&"inner"!=c.options.zoomType&&(f=c.zoomTintImage,g=f.clone(),c.zoomTintImage.attr("src",a),c.zoomTintImage.after(g),g.stop(!0).fadeOut(c.options.imageCrossfade,function(){d(this).remove()}),f.fadeIn(c.options.imageCrossfade),c.zoomTint.css({height:c.$elem.height()}),c.zoomTint.css({width:c.$elem.width()}));c.zoomContainer.css("height",c.$elem.height());c.zoomContainer.css("width",c.$elem.width());"inner"!=c.options.zoomType||c.options.constrainType||
(c.zoomWrap.parent().css("height",c.$elem.height()),c.zoomWrap.parent().css("width",c.$elem.width()),c.zoomWindow.css("height",c.$elem.height()),c.zoomWindow.css("width",c.$elem.width()))}else c.$elem.attr("src",b),c.options.tint&&(c.zoomTintImage.attr("src",a),c.zoomTintImage.attr("height",c.$elem.height()),c.zoomTintImage.css({height:c.$elem.height()}),c.zoomTint.css({height:c.$elem.height()})),c.zoomContainer.css("height",c.$elem.height()),c.zoomContainer.css("width",c.$elem.width());c.options.imageCrossfade&&
(c.zoomWrap.css("height",c.$elem.height()),c.zoomWrap.css("width",c.$elem.width()));c.options.constrainType&&("height"==c.options.constrainType&&(c.zoomContainer.css("height",c.options.constrainSize),c.zoomContainer.css("width","auto"),c.options.imageCrossfade?(c.zoomWrap.css("height",c.options.constrainSize),c.zoomWrap.css("width","auto"),c.constwidth=c.zoomWrap.width()):(c.$elem.css("height",c.options.constrainSize),c.$elem.css("width","auto"),c.constwidth=c.$elem.width()),"inner"==c.options.zoomType&&
(c.zoomWrap.parent().css("height",c.options.constrainSize),c.zoomWrap.parent().css("width",c.constwidth),c.zoomWindow.css("height",c.options.constrainSize),c.zoomWindow.css("width",c.constwidth)),c.options.tint&&(c.tintContainer.css("height",c.options.constrainSize),c.tintContainer.css("width",c.constwidth),c.zoomTint.css("height",c.options.constrainSize),c.zoomTint.css("width",c.constwidth),c.zoomTintImage.css("height",c.options.constrainSize),c.zoomTintImage.css("width",c.constwidth))),"width"==
c.options.constrainType&&(c.zoomContainer.css("height","auto"),c.zoomContainer.css("width",c.options.constrainSize),c.options.imageCrossfade?(c.zoomWrap.css("height","auto"),c.zoomWrap.css("width",c.options.constrainSize),c.constheight=c.zoomWrap.height()):(c.$elem.css("height","auto"),c.$elem.css("width",c.options.constrainSize),c.constheight=c.$elem.height()),"inner"==c.options.zoomType&&(c.zoomWrap.parent().css("height",c.constheight),c.zoomWrap.parent().css("width",c.options.constrainSize),c.zoomWindow.css("height",
c.constheight),c.zoomWindow.css("width",c.options.constrainSize)),c.options.tint&&(c.tintContainer.css("height",c.constheight),c.tintContainer.css("width",c.options.constrainSize),c.zoomTint.css("height",c.constheight),c.zoomTint.css("width",c.options.constrainSize),c.zoomTintImage.css("height",c.constheight),c.zoomTintImage.css("width",c.options.constrainSize))))},doneCallback:function(){this.options.loadingIcon&&this.spinner.hide();this.nzOffset=this.$elem.offset();this.nzWidth=this.$elem.width();
this.nzHeight=this.$elem.height();this.currentZoomLevel=this.options.zoomLevel;this.widthRatio=this.largeWidth/this.nzWidth;this.heightRatio=this.largeHeight/this.nzHeight;"window"==this.options.zoomType&&(lensHeight=this.nzHeight<this.options.zoomWindowWidth/this.widthRatio?this.nzHeight:String(this.options.zoomWindowHeight/this.heightRatio),lensWidth=this.options.zoomWindowWidth<this.options.zoomWindowWidth?this.nzWidth:this.options.zoomWindowWidth/this.widthRatio,this.zoomLens&&(this.zoomLens.css("width",
lensWidth),this.zoomLens.css("height",lensHeight)))},getCurrentImage:function(){return this.zoomImage},getGalleryList:function(){var b=this;b.gallerylist=[];b.options.gallery?d("#"+b.options.gallery+" a").each(function(){var a="";d(this).data("zoom-image")?a=d(this).data("zoom-image"):d(this).data("image")&&(a=d(this).data("image"));a==b.zoomImage?b.gallerylist.unshift({href:""+a+"",title:d(this).find("img").attr("title")}):b.gallerylist.push({href:""+a+"",title:d(this).find("img").attr("title")})}):
b.gallerylist.push({href:""+b.zoomImage+"",title:d(this).find("img").attr("title")});return b.gallerylist},changeZoomLevel:function(b){this.scrollingLock=!0;this.newvalue=parseFloat(b).toFixed(2);newvalue=parseFloat(b).toFixed(2);maxheightnewvalue=this.largeHeight/(this.options.zoomWindowHeight/this.nzHeight*this.nzHeight);maxwidthtnewvalue=this.largeWidth/(this.options.zoomWindowWidth/this.nzWidth*this.nzWidth);"inner"!=this.options.zoomType&&(maxheightnewvalue<=newvalue?(this.heightRatio=this.largeHeight/
maxheightnewvalue/this.nzHeight,this.newvalueheight=maxheightnewvalue,this.fullheight=!0):(this.heightRatio=this.largeHeight/newvalue/this.nzHeight,this.newvalueheight=newvalue,this.fullheight=!1),maxwidthtnewvalue<=newvalue?(this.widthRatio=this.largeWidth/maxwidthtnewvalue/this.nzWidth,this.newvaluewidth=maxwidthtnewvalue,this.fullwidth=!0):(this.widthRatio=this.largeWidth/newvalue/this.nzWidth,this.newvaluewidth=newvalue,this.fullwidth=!1),"lens"==this.options.zoomType&&(maxheightnewvalue<=newvalue?
(this.fullwidth=!0,this.newvaluewidth=maxheightnewvalue):(this.widthRatio=this.largeWidth/newvalue/this.nzWidth,this.newvaluewidth=newvalue,this.fullwidth=!1)));"inner"==this.options.zoomType&&(maxheightnewvalue=parseFloat(this.largeHeight/this.nzHeight).toFixed(2),maxwidthtnewvalue=parseFloat(this.largeWidth/this.nzWidth).toFixed(2),newvalue>maxheightnewvalue&&(newvalue=maxheightnewvalue),newvalue>maxwidthtnewvalue&&(newvalue=maxwidthtnewvalue),maxheightnewvalue<=newvalue?(this.heightRatio=this.largeHeight/
newvalue/this.nzHeight,this.newvalueheight=newvalue>maxheightnewvalue?maxheightnewvalue:newvalue,this.fullheight=!0):(this.heightRatio=this.largeHeight/newvalue/this.nzHeight,this.newvalueheight=newvalue>maxheightnewvalue?maxheightnewvalue:newvalue,this.fullheight=!1),maxwidthtnewvalue<=newvalue?(this.widthRatio=this.largeWidth/newvalue/this.nzWidth,this.newvaluewidth=newvalue>maxwidthtnewvalue?maxwidthtnewvalue:newvalue,this.fullwidth=!0):(this.widthRatio=this.largeWidth/newvalue/this.nzWidth,this.newvaluewidth=
newvalue,this.fullwidth=!1));scrcontinue=!1;"inner"==this.options.zoomType&&(this.nzWidth>this.nzHeight&&(this.newvaluewidth<=maxwidthtnewvalue?scrcontinue=!0:(scrcontinue=!1,this.fullwidth=this.fullheight=!0)),this.nzHeight>this.nzWidth&&(this.newvaluewidth<=maxwidthtnewvalue?scrcontinue=!0:(scrcontinue=!1,this.fullwidth=this.fullheight=!0)));"inner"!=this.options.zoomType&&(scrcontinue=!0);scrcontinue&&(this.zoomLock=0,this.changeZoom=!0,this.options.zoomWindowHeight/this.heightRatio<=this.nzHeight&&
(this.currentZoomLevel=this.newvalueheight,"lens"!=this.options.zoomType&&"inner"!=this.options.zoomType&&(this.changeBgSize=!0,this.zoomLens.css({height:String(this.options.zoomWindowHeight/this.heightRatio)+"px"})),"lens"==this.options.zoomType||"inner"==this.options.zoomType)&&(this.changeBgSize=!0),this.options.zoomWindowWidth/this.widthRatio<=this.nzWidth&&("inner"!=this.options.zoomType&&this.newvaluewidth>this.newvalueheight&&(this.currentZoomLevel=this.newvaluewidth),"lens"!=this.options.zoomType&&
"inner"!=this.options.zoomType&&(this.changeBgSize=!0,this.zoomLens.css({width:String(this.options.zoomWindowWidth/this.widthRatio)+"px"})),"lens"==this.options.zoomType||"inner"==this.options.zoomType)&&(this.changeBgSize=!0),"inner"==this.options.zoomType&&(this.changeBgSize=!0,this.nzWidth>this.nzHeight&&(this.currentZoomLevel=this.newvaluewidth),this.nzHeight>this.nzWidth&&(this.currentZoomLevel=this.newvaluewidth)));this.setPosition(this.currentLoc)},closeAll:function(){self.zoomWindow&&self.zoomWindow.hide();
self.zoomLens&&self.zoomLens.hide();self.zoomTint&&self.zoomTint.hide()},changeState:function(b){"enable"==b&&(this.options.zoomEnabled=!0);"disable"==b&&(this.options.zoomEnabled=!1)}};d.fn.elevateZoom=function(b){return this.each(function(){var a=Object.create(k);a.init(b,this);d.data(this,"elevateZoom",a)})};d.fn.elevateZoom.options={zoomActivation:"hover",zoomEnabled:!0,preloading:1,zoomLevel:1,scrollZoom:!1,scrollZoomIncrement:0.1,minZoomLevel:!1,maxZoomLevel:!1,easing:!1,easingAmount:12,lensSize:200,
zoomWindowWidth:400,zoomWindowHeight:400,zoomWindowOffetx:0,zoomWindowOffety:0,zoomWindowPosition:1,zoomWindowBgColour:"#fff",lensFadeIn:!1,lensFadeOut:!1,debug:!1,zoomWindowFadeIn:!1,zoomWindowFadeOut:!1,zoomWindowAlwaysShow:!1,zoomTintFadeIn:!1,zoomTintFadeOut:!1,borderSize:4,showLens:!0,borderColour:"#888",lensBorderSize:1,lensBorderColour:"#000",lensShape:"square",zoomType:"window",containLensZoom:!1,lensColour:"white",lensOpacity:0.4,lenszoom:!1,tint:!1,tintColour:"#333",tintOpacity:0.4,gallery:!1,
galleryActiveClass:"zoomGalleryActive",imageCrossfade:!1,constrainType:!1,constrainSize:!1,loadingIcon:!1,cursor:"default",responsive:!0,onComplete:d.noop,onZoomedImageLoaded:function(){},onImageSwap:d.noop,onImageSwapComplete:d.noop}})(jQuery,window,document);
define("elevatezoom", function(){});

define('modules/views-productimages',['modules/jquery-mozu', 'underscore', "modules/backbone-mozu", 'hyprlive', "hyprlivecontext"], function($, _, Backbone, Hypr, HyprLiveContext) {

    var width_thumb = HyprLiveContext.locals.themeSettings.maxProductImageThumbnailSize;
    var width_pdp = HyprLiveContext.locals.themeSettings.productImagePdpMaxWidth;
    var width_zoom = HyprLiveContext.locals.themeSettings.productZoomImageMaxWidth;

    //using GET request CheckImage function checks whether an image exist or not
    var checkImage = function(imagepath, callback) {
        $.get(imagepath).done(function() {
            callback(true); //return true if image exist
        }).error(function() {
            callback(false);
        });
    };

    var ProductPageImagesView = Backbone.MozuView.extend({
        templateName: 'modules/product/product-images',
        events: {
            'mouseenter [data-mz-productimage-thumb]': 'onMouseEnterChangeThumbImage',
            'mouseleave [data-mz-productimage-thumb]': 'onMouseLeaveResetThumbImage',
            'click [data-mz-productimage-thumb]': 'switchImage'
        },
        initialize: function() {
            // preload images
            var self = this;
            self.model.on("change:productImages", function(model, images){
                self.clearImageCache();
                self.initImages(self.model.get('productImages'));
                self.render();
                if(images.length) {
                    self.selectedImageIx = images[0].sequence;
                    self.updateMainImage();
                }

            });
            self.initImages();
        },
        initImages: function(images){
            var imageCache = this.imageCache = {},
                cacheKey = Hypr.engine.options.locals.siteContext.generalSettings.cdnCacheBustKey;

                images = images || [];

                if(!images.length) {
                    images = this.model.get('content').get('productImages');
                }

            _.each(images, function (img) {
                var i = new Image();
                i.src = img.imageUrl + '?maxWidth=' + Hypr.getThemeSetting('productImagePdpMaxWidth') + '&_mzCb=' + cacheKey;
                i.zoomsrc = img.imageUrl + '?maxWidth=' + Hypr.getThemeSetting('productZoomImageMaxWidth') + '&_mzCb=' + cacheKey;
                if (img.altText) {
                    i.alt = img.altText;
                }
                imageCache[img.sequence.toString()] = i;
            });
        },
        onMouseEnterChangeThumbImage: function(_e){
            var img_url = $(_e.currentTarget).find('img').attr('src');
            img_url = img_url.replace('maxWidth='+width_thumb, 'maxWidth='+width_pdp);
            this.mainImage = $('.mz-productimages-mainimage').attr('src');
            checkImage(img_url, function(response) {
                if (response) {
                    $('.mz-productimages-mainimage').attr('src', img_url);
                }
            });
        },
        onMouseLeaveResetThumbImage: function(_e){
            var img_url = $('.mz-productimages-mainimage').data('zoom-image').replace('maxWidth='+width_zoom, 'maxWidth='+width_pdp);
            checkImage(img_url, function(response) {
                if (response) {
                    $('.mz-productimages-mainimage').attr('src', img_url);
                }
            });
        },
        switchImage: function(e) {
            $(e.currentTarget).parents("ul").find("li").removeClass("active");
            $(e.currentTarget).addClass("active");

            var $thumb = $(e.currentTarget).find('img');
            this.selectedMainImageSrc = $thumb.attr('src');
            this.selectedMainImageAltText = $thumb.attr('alt');
            this.selectedImageIx = $(e.currentTarget).data('mz-productimage-thumb');
            this.updateMainImage();
            return false;
        },
        clearImageCache: function(){
            this.imageCache = {};
        },
        updateMainImage: function() {
            var self = this;
            if (!$('#zoom').length) {
                $('.mz-productimages-main').html('<img class="mz-productimages-mainimage" data-mz-productimage-main="" id="zoom" itemprop="image">');
            }
            checkImage(this.selectedMainImageSrc.replace('maxWidth='+width_thumb, 'maxWidth=' + Hypr.getThemeSetting('productImagePdpMaxWidth')), function(response) {
                if (response) {
                    self.$('#zoom')
                        .prop('src', self.selectedMainImageSrc.replace('maxWidth='+width_thumb, 'maxWidth=' + Hypr.getThemeSetting('productImagePdpMaxWidth')))
                        .prop('alt', self.selectedMainImageAltText);
                    $('.zoomContainer').remove();
                    $('#zoom').removeData('elevateZoom').data('zoom-image', self.selectedMainImageSrc.replace('maxWidth='+width_thumb, 'maxWidth=' + Hypr.getThemeSetting('productZoomImageMaxWidth'))).elevateZoom({ zoomType: "inner", cursor: "crosshair", responsive: true });
                 }
            });
        },
        render: function() {
            //Backbone.MozuView.prototype.render.apply(this, arguments);
            //this.updateMainImage();
        }
    });


    return {
        ProductPageImagesView: ProductPageImagesView
    };

});

define('pages/family',[
    'modules/jquery-mozu',
    'underscore',
    "modules/api",
    "modules/backbone-mozu",
    'hyprlivecontext',
    "bxslider",
    'modules/block-ui',
    "hyprlive",
    'modules/models-product'
], function($, _, api, Backbone, HyprLiveContext, bxslider, blockUiLoader, Hypr, ProductModels) {
    var sitecontext = HyprLiveContext.locals.siteContext,
    cdn = sitecontext.cdnPrefix,
    siteID = cdn.substring(cdn.lastIndexOf('-') + 1),
    imagefilepath = cdn + '/cms/' + siteID + '/files',
    width_fam = HyprLiveContext.locals.themeSettings.familyProductImageMaxWidth,
    deviceType = navigator.userAgent.match(/Android|BlackBerry|iPhone|iPod|Opera Mini|IEMobile/i),
   
    //using GET request CheckImage function checks whether an image exist or not
    checkImage = function(imagepath, callback) {
        $.get(imagepath).done(function() {
            callback(true); //return true if image exist
        }).error(function() {
            callback(false);
        });
    };

    var FamilyItemView = Backbone.MozuView.extend({
        tagName: 'div',
        className: 'mz-familylist-item col-xs-12',
        templateName: 'modules/product/family/family-item',
        additionalEvents: {
            "click [data-mz-product-option-attribute]": "onOptionChangeAttribute",
            "click [data-mz-qty-minus]": "quantityMinus",
            "click [data-mz-qty-plus]": "quantityPlus",
            'mouseenter .color-options': 'onMouseEnterChangeImage',
            'mouseleave .color-options': 'onMouseLeaveResetImage'
        },
        initialize: function() {
            var self = this;
            self.listenTo(self.model, 'change', self.render);
        },
        render: function() {
            var id = Hypr.getThemeSetting('oneSizeAttributeName'),
                oneSizeOption = this.model.get('options').get(id);
            if(oneSizeOption){
                var onlyEnabledOneSizeOption = _.find(oneSizeOption.get('values'), function(value){ return value.isEnabled; });
                oneSizeOption.set('value', onlyEnabledOneSizeOption.value);
            }
            Backbone.MozuView.prototype.render.apply(this);
            return this;
        },
        quantityMinus: function() {
            this.model.messages.reset();
            var qty = this.model.get('quantity');
            if (qty === 0) {
                //this.model.trigger('error', {message: Hypr.getLabel("quantityZeroError")});
                return;
            }
            this.model.set('quantity',--qty);
        },
        quantityPlus: function() {
            this.model.messages.reset();
            var qty = this.model.get('quantity');
            this.model.set('quantity',++qty);
        },
        onOptionChangeAttribute: function(e) {
            return this.configureAttribute($(e.currentTarget));
        },
        configureAttribute: function($optionEl) {
            var $this = this;
            if (!$optionEl.hasClass("active")) {
                if ($optionEl.attr('disabled') == 'disabled') {
                    return false;
                } else {
                    blockUiLoader.globalLoader();
                    var newValue = $optionEl.data('value'),
                        oldValue,
                        id = $optionEl.data('mz-product-option-attribute'),
                        optionEl = $optionEl[0],
                        isPicked = (optionEl.type !== "checkbox" && optionEl.type !== "radio") || optionEl.checked,
                        option = this.model.get('options').get(id);
                    if (!option) {
                        var byIDVal = JSON.parse(JSON.stringify(this.model.get('options')._byId));
                        for (var key in byIDVal) {
                            if (id === byIDVal[key].attributeFQN) {
                                option = this.model.get('options').get(key);
                            }
                        }
                    }
                    if (option) {
                        if (option.get('attributeDetail').inputType === "YesNo") {
                            option.set("value", isPicked);
                        } else if (isPicked) {
                            oldValue = option.get('value');
                            if (oldValue !== newValue && !(oldValue === undefined && newValue === '')) {
                                option.set('value', newValue);
                            }
                        }
                    }
                    this.model.whenReady(function() { 
                        setTimeout(function() {
                            blockUiLoader.unblockUi();
                            $this.isColorClicked = false; 
                        }, 1000);
                    });
                }
            }
        },
        onMouseEnterChangeImage: function(_e) {
            if (!deviceType) {            	           	
            	this.mainImage = $(_e.delegateTarget).find('img').attr('src');                
                var colorCode = $(_e.currentTarget).data('mz-swatch-color');
                this.changeImages(_e,colorCode, 'N');
            }
        },
        onMouseLeaveResetImage: function(_e) {
            if (!this.isColorClicked && !deviceType) {
                var colorCode = $(_e.delegateTarget).find('ul.product-color-swatches').find('li.active').data('mz-swatch-color');
                if (typeof colorCode != 'undefined') {
                    this.changeImages(_e,colorCode, 'N');
                } else if (typeof this.mainImage != 'undefined') {
                    $(_e.delegateTarget).find('img').attr('src', this.mainImage);
                } else {
                    $('.mz-productimages-main').html('<span class="mz-productlisting-imageplaceholder img-responsive"><span class="mz-productlisting-imageplaceholdertext">[no image]</span></span>');
                }
            }
        },
        selectSwatch: function(e) {
            this.isColorClicked = true;
            var colorCode = $(e.currentTarget).data('mz-swatch-color');
            this.changeImages(e,colorCode, 'Y');

        },
        changeImages: function(_e,colorCode, _updateThumbNails) {
            var self = this;
            var version = 1;
       
            var imagepath = imagefilepath + '/' + this.model.attributes.productCode + '_' + colorCode + '_v' + version + '.jpg';
            var mainImage = imagepath + '?maxWidth='+ width_fam;
      
            var _this = this;
            //TODO: following function is checking if images exist on server or not
            checkImage(imagepath, function(response) {
                if (response) {
                    	$(_e.delegateTarget).find('img').attr('src', mainImage);
                        if(self.isColorClicked)
                            self.model.set('mainImage', imagepath);
                } else if (typeof self.mainImage === 'undefined') {
                    $('.mz-productimages-main').html('<span class="mz-productlisting-imageplaceholder img-responsive"><span class="mz-productlisting-imageplaceholdertext">[no image]</span></span>');
                }
               
            });
        }
    });
    var Model = Backbone.MozuModel.extend();
    return FamilyItemView;
});

!function(e,t){"object"==typeof exports&&"undefined"!=typeof module?t(exports):"function"==typeof define&&define.amd?define('async',["exports"],t):t(e.async=e.async||{})}(this,function(exports){function apply(e,t,r){switch(r.length){case 0:return e.call(t);case 1:return e.call(t,r[0]);case 2:return e.call(t,r[0],r[1]);case 3:return e.call(t,r[0],r[1],r[2])}return e.apply(t,r)}function overRest$1(e,t,r){return t=nativeMax(void 0===t?e.length-1:t,0),function(){for(var n=arguments,o=-1,i=nativeMax(n.length-t,0),a=Array(i);++o<i;)a[o]=n[t+o];o=-1;for(var s=Array(t+1);++o<t;)s[o]=n[o];return s[t]=r(a),apply(e,this,s)}}function identity(e){return e}function rest(e,t){return overRest$1(e,t,identity)}function isObject(e){var t=typeof e;return null!=e&&("object"==t||"function"==t)}function asyncify(e){return initialParams(function(t,r){var n;try{n=e.apply(this,t)}catch(e){return r(e)}isObject(n)&&"function"==typeof n.then?n.then(function(e){r(null,e)},function(e){r(e.message?e:new Error(e))}):r(null,n)})}function supportsAsync(){var supported;try{supported=isAsync(eval("(async function () {})"))}catch(e){supported=!1}return supported}function isAsync(e){return supportsSymbol&&"AsyncFunction"===e[Symbol.toStringTag]}function wrapAsync(e){return isAsync(e)?asyncify(e):e}function applyEach$1(e){return rest(function(t,r){var n=initialParams(function(r,n){var o=this;return e(t,function(e,t){wrapAsync$1(e).apply(o,r.concat(t))},n)});return r.length?n.apply(this,r):n})}function getRawTag(e){var t=hasOwnProperty.call(e,symToStringTag$1),r=e[symToStringTag$1];try{e[symToStringTag$1]=void 0;var n=!0}catch(e){}var o=nativeObjectToString.call(e);return n&&(t?e[symToStringTag$1]=r:delete e[symToStringTag$1]),o}function objectToString(e){return nativeObjectToString$1.call(e)}function baseGetTag(e){return null==e?void 0===e?undefinedTag:nullTag:(e=Object(e),symToStringTag&&symToStringTag in e?getRawTag(e):objectToString(e))}function isFunction(e){if(!isObject(e))return!1;var t=baseGetTag(e);return t==funcTag||t==genTag||t==asyncTag||t==proxyTag}function isLength(e){return"number"==typeof e&&e>-1&&e%1==0&&e<=MAX_SAFE_INTEGER}function isArrayLike(e){return null!=e&&isLength(e.length)&&!isFunction(e)}function noop(){}function once(e){return function(){if(null!==e){var t=e;e=null,t.apply(this,arguments)}}}function baseTimes(e,t){for(var r=-1,n=Array(e);++r<e;)n[r]=t(r);return n}function isObjectLike(e){return null!=e&&"object"==typeof e}function baseIsArguments(e){return isObjectLike(e)&&baseGetTag(e)==argsTag}function stubFalse(){return!1}function isIndex(e,t){return t=null==t?MAX_SAFE_INTEGER$1:t,!!t&&("number"==typeof e||reIsUint.test(e))&&e>-1&&e%1==0&&e<t}function baseIsTypedArray(e){return isObjectLike(e)&&isLength(e.length)&&!!typedArrayTags[baseGetTag(e)]}function baseUnary(e){return function(t){return e(t)}}function arrayLikeKeys(e,t){var r=isArray(e),n=!r&&isArguments(e),o=!r&&!n&&isBuffer(e),i=!r&&!n&&!o&&isTypedArray(e),a=r||n||o||i,s=a?baseTimes(e.length,String):[],c=s.length;for(var u in e)!t&&!hasOwnProperty$1.call(e,u)||a&&("length"==u||o&&("offset"==u||"parent"==u)||i&&("buffer"==u||"byteLength"==u||"byteOffset"==u)||isIndex(u,c))||s.push(u);return s}function isPrototype(e){var t=e&&e.constructor,r="function"==typeof t&&t.prototype||objectProto$5;return e===r}function overArg(e,t){return function(r){return e(t(r))}}function baseKeys(e){if(!isPrototype(e))return nativeKeys(e);var t=[];for(var r in Object(e))hasOwnProperty$3.call(e,r)&&"constructor"!=r&&t.push(r);return t}function keys(e){return isArrayLike(e)?arrayLikeKeys(e):baseKeys(e)}function createArrayIterator(e){var t=-1,r=e.length;return function(){return++t<r?{value:e[t],key:t}:null}}function createES2015Iterator(e){var t=-1;return function(){var r=e.next();return r.done?null:(t++,{value:r.value,key:t})}}function createObjectIterator(e){var t=keys(e),r=-1,n=t.length;return function(){var o=t[++r];return r<n?{value:e[o],key:o}:null}}function iterator(e){if(isArrayLike(e))return createArrayIterator(e);var t=getIterator(e);return t?createES2015Iterator(t):createObjectIterator(e)}function onlyOnce(e){return function(){if(null===e)throw new Error("Callback was already called.");var t=e;e=null,t.apply(this,arguments)}}function _eachOfLimit(e){return function(t,r,n){function o(e,t){if(c-=1,e)s=!0,n(e);else{if(t===breakLoop||s&&c<=0)return s=!0,n(null);i()}}function i(){for(;c<e&&!s;){var t=a();if(null===t)return s=!0,void(c<=0&&n(null));c+=1,r(t.value,t.key,onlyOnce(o))}}if(n=once(n||noop),e<=0||!t)return n(null);var a=iterator(t),s=!1,c=0;i()}}function eachOfLimit(e,t,r,n){_eachOfLimit(t)(e,wrapAsync$1(r),n)}function doLimit(e,t){return function(r,n,o){return e(r,t,n,o)}}function eachOfArrayLike(e,t,r){function n(e,t){e?r(e):++i!==a&&t!==breakLoop||r(null)}r=once(r||noop);var o=0,i=0,a=e.length;for(0===a&&r(null);o<a;o++)t(e[o],o,onlyOnce(n))}function doParallel(e){return function(t,r,n){return e(eachOf,t,wrapAsync$1(r),n)}}function _asyncMap(e,t,r,n){n=n||noop,t=t||[];var o=[],i=0,a=wrapAsync$1(r);e(t,function(e,t,r){var n=i++;a(e,function(e,t){o[n]=t,r(e)})},function(e){n(e,o)})}function doParallelLimit(e){return function(t,r,n,o){return e(_eachOfLimit(r),t,wrapAsync$1(n),o)}}function arrayEach(e,t){for(var r=-1,n=null==e?0:e.length;++r<n&&t(e[r],r,e)!==!1;);return e}function createBaseFor(e){return function(t,r,n){for(var o=-1,i=Object(t),a=n(t),s=a.length;s--;){var c=a[e?s:++o];if(r(i[c],c,i)===!1)break}return t}}function baseForOwn(e,t){return e&&baseFor(e,t,keys)}function baseFindIndex(e,t,r,n){for(var o=e.length,i=r+(n?1:-1);n?i--:++i<o;)if(t(e[i],i,e))return i;return-1}function baseIsNaN(e){return e!==e}function strictIndexOf(e,t,r){for(var n=r-1,o=e.length;++n<o;)if(e[n]===t)return n;return-1}function baseIndexOf(e,t,r){return t===t?strictIndexOf(e,t,r):baseFindIndex(e,baseIsNaN,r)}function arrayMap(e,t){for(var r=-1,n=null==e?0:e.length,o=Array(n);++r<n;)o[r]=t(e[r],r,e);return o}function isSymbol(e){return"symbol"==typeof e||isObjectLike(e)&&baseGetTag(e)==symbolTag}function baseToString(e){if("string"==typeof e)return e;if(isArray(e))return arrayMap(e,baseToString)+"";if(isSymbol(e))return symbolToString?symbolToString.call(e):"";var t=e+"";return"0"==t&&1/e==-INFINITY?"-0":t}function baseSlice(e,t,r){var n=-1,o=e.length;t<0&&(t=-t>o?0:o+t),r=r>o?o:r,r<0&&(r+=o),o=t>r?0:r-t>>>0,t>>>=0;for(var i=Array(o);++n<o;)i[n]=e[n+t];return i}function castSlice(e,t,r){var n=e.length;return r=void 0===r?n:r,!t&&r>=n?e:baseSlice(e,t,r)}function charsEndIndex(e,t){for(var r=e.length;r--&&baseIndexOf(t,e[r],0)>-1;);return r}function charsStartIndex(e,t){for(var r=-1,n=e.length;++r<n&&baseIndexOf(t,e[r],0)>-1;);return r}function asciiToArray(e){return e.split("")}function hasUnicode(e){return reHasUnicode.test(e)}function unicodeToArray(e){return e.match(reUnicode)||[]}function stringToArray(e){return hasUnicode(e)?unicodeToArray(e):asciiToArray(e)}function toString(e){return null==e?"":baseToString(e)}function trim(e,t,r){if(e=toString(e),e&&(r||void 0===t))return e.replace(reTrim,"");if(!e||!(t=baseToString(t)))return e;var n=stringToArray(e),o=stringToArray(t),i=charsStartIndex(n,o),a=charsEndIndex(n,o)+1;return castSlice(n,i,a).join("")}function parseParams(e){return e=e.toString().replace(STRIP_COMMENTS,""),e=e.match(FN_ARGS)[2].replace(" ",""),e=e?e.split(FN_ARG_SPLIT):[],e=e.map(function(e){return trim(e.replace(FN_ARG,""))})}function autoInject(e,t){var r={};baseForOwn(e,function(e,t){function n(t,r){var n=arrayMap(o,function(e){return t[e]});n.push(r),wrapAsync$1(e).apply(null,n)}var o,i=isAsync(e),a=!i&&1===e.length||i&&0===e.length;if(isArray(e))o=e.slice(0,-1),e=e[e.length-1],r[t]=o.concat(o.length>0?n:e);else if(a)r[t]=e;else{if(o=parseParams(e),0===e.length&&!i&&0===o.length)throw new Error("autoInject task functions require explicit parameters.");i||o.pop(),r[t]=o.concat(n)}}),auto(r,t)}function fallback(e){setTimeout(e,0)}function wrap(e){return rest(function(t,r){e(function(){t.apply(null,r)})})}function DLL(){this.head=this.tail=null,this.length=0}function setInitial(e,t){e.length=1,e.head=e.tail=t}function queue(e,t,r){function n(e,t,r){if(null!=r&&"function"!=typeof r)throw new Error("task callback must be a function");if(u.started=!0,isArray(e)||(e=[e]),0===e.length&&u.idle())return setImmediate$1(function(){u.drain()});for(var n=0,o=e.length;n<o;n++){var i={data:e[n],callback:r||noop};t?u._tasks.unshift(i):u._tasks.push(i)}setImmediate$1(u.process)}function o(e){return rest(function(t){a-=1;for(var r=0,n=e.length;r<n;r++){var o=e[r],i=baseIndexOf(s,o,0);i>=0&&s.splice(i),o.callback.apply(o,t),null!=t[0]&&u.error(t[0],o.data)}a<=u.concurrency-u.buffer&&u.unsaturated(),u.idle()&&u.drain(),u.process()})}if(null==t)t=1;else if(0===t)throw new Error("Concurrency must not be zero");var i=wrapAsync$1(e),a=0,s=[],c=!1,u={_tasks:new DLL,concurrency:t,payload:r,saturated:noop,unsaturated:noop,buffer:t/4,empty:noop,drain:noop,error:noop,started:!1,paused:!1,push:function(e,t){n(e,!1,t)},kill:function(){u.drain=noop,u._tasks.empty()},unshift:function(e,t){n(e,!0,t)},process:function(){if(!c){for(c=!0;!u.paused&&a<u.concurrency&&u._tasks.length;){var e=[],t=[],r=u._tasks.length;u.payload&&(r=Math.min(r,u.payload));for(var n=0;n<r;n++){var l=u._tasks.shift();e.push(l),t.push(l.data)}0===u._tasks.length&&u.empty(),a+=1,s.push(e[0]),a===u.concurrency&&u.saturated();var f=onlyOnce(o(e));i(t,f)}c=!1}},length:function(){return u._tasks.length},running:function(){return a},workersList:function(){return s},idle:function(){return u._tasks.length+a===0},pause:function(){u.paused=!0},resume:function(){u.paused!==!1&&(u.paused=!1,setImmediate$1(u.process))}};return u}function cargo(e,t){return queue(e,1,t)}function reduce(e,t,r,n){n=once(n||noop);var o=wrapAsync$1(r);eachOfSeries(e,function(e,r,n){o(t,e,function(e,r){t=r,n(e)})},function(e){n(e,t)})}function concat$1(e,t,r,n){var o=[];e(t,function(e,t,n){r(e,function(e,t){o=o.concat(t||[]),n(e)})},function(e){n(e,o)})}function doSeries(e){return function(t,r,n){return e(eachOfSeries,t,wrapAsync$1(r),n)}}function _createTester(e,t){return function(r,n,o,i){i=i||noop;var a,s=!1;r(n,function(r,n,i){o(r,function(n,o){n?i(n):e(o)&&!a?(s=!0,a=t(!0,r),i(null,breakLoop)):i()})},function(e){e?i(e):i(null,s?a:t(!1))})}}function _findGetResult(e,t){return t}function consoleFunc(e){return rest(function(t,r){wrapAsync$1(t).apply(null,r.concat(rest(function(t,r){"object"==typeof console&&(t?console.error&&console.error(t):console[e]&&arrayEach(r,function(t){console[e](t)}))})))})}function doDuring(e,t,r){function n(e,t){return e?r(e):t?void o(a):r(null)}r=onlyOnce(r||noop);var o=wrapAsync$1(e),i=wrapAsync$1(t),a=rest(function(e,t){return e?r(e):(t.push(n),void i.apply(this,t))});n(null,!0)}function doWhilst(e,t,r){r=onlyOnce(r||noop);var n=wrapAsync$1(e),o=rest(function(e,i){return e?r(e):t.apply(this,i)?n(o):void r.apply(null,[null].concat(i))});n(o)}function doUntil(e,t,r){doWhilst(e,function(){return!t.apply(this,arguments)},r)}function during(e,t,r){function n(e){return e?r(e):void a(o)}function o(e,t){return e?r(e):t?void i(n):r(null)}r=onlyOnce(r||noop);var i=wrapAsync$1(t),a=wrapAsync$1(e);a(o)}function _withoutIndex(e){return function(t,r,n){return e(t,n)}}function eachLimit(e,t,r){eachOf(e,_withoutIndex(wrapAsync$1(t)),r)}function eachLimit$1(e,t,r,n){_eachOfLimit(t)(e,_withoutIndex(wrapAsync$1(r)),n)}function ensureAsync(e){return isAsync(e)?e:initialParams(function(t,r){var n=!0;t.push(function(){var e=arguments;n?setImmediate$1(function(){r.apply(null,e)}):r.apply(null,e)}),e.apply(this,t),n=!1})}function notId(e){return!e}function baseProperty(e){return function(t){return null==t?void 0:t[e]}}function filterArray(e,t,r,n){var o=new Array(t.length);e(t,function(e,t,n){r(e,function(e,r){o[t]=!!r,n(e)})},function(e){if(e)return n(e);for(var r=[],i=0;i<t.length;i++)o[i]&&r.push(t[i]);n(null,r)})}function filterGeneric(e,t,r,n){var o=[];e(t,function(e,t,n){r(e,function(r,i){r?n(r):(i&&o.push({index:t,value:e}),n())})},function(e){e?n(e):n(null,arrayMap(o.sort(function(e,t){return e.index-t.index}),baseProperty("value")))})}function _filter(e,t,r,n){var o=isArrayLike(t)?filterArray:filterGeneric;o(e,t,wrapAsync$1(r),n||noop)}function forever(e,t){function r(e){return e?n(e):void o(r)}var n=onlyOnce(t||noop),o=wrapAsync$1(ensureAsync(e));r()}function mapValuesLimit(e,t,r,n){n=once(n||noop);var o={},i=wrapAsync$1(r);eachOfLimit(e,t,function(e,t,r){i(e,t,function(e,n){return e?r(e):(o[t]=n,void r())})},function(e){n(e,o)})}function has(e,t){return t in e}function memoize(e,t){var r=Object.create(null),n=Object.create(null);t=t||identity;var o=wrapAsync$1(e),i=initialParams(function(e,i){var a=t.apply(null,e);has(r,a)?setImmediate$1(function(){i.apply(null,r[a])}):has(n,a)?n[a].push(i):(n[a]=[i],o.apply(null,e.concat(rest(function(e){r[a]=e;var t=n[a];delete n[a];for(var o=0,i=t.length;o<i;o++)t[o].apply(null,e)}))))});return i.memo=r,i.unmemoized=e,i}function _parallel(e,t,r){r=r||noop;var n=isArrayLike(t)?[]:{};e(t,function(e,t,r){wrapAsync$1(e)(rest(function(e,o){o.length<=1&&(o=o[0]),n[t]=o,r(e)}))},function(e){r(e,n)})}function parallelLimit(e,t){_parallel(eachOf,e,t)}function parallelLimit$1(e,t,r){_parallel(_eachOfLimit(t),e,r)}function race(e,t){if(t=once(t||noop),!isArray(e))return t(new TypeError("First argument to race must be an array of functions"));if(!e.length)return t();for(var r=0,n=e.length;r<n;r++)wrapAsync$1(e[r])(t)}function reduceRight(e,t,r,n){var o=slice.call(e).reverse();reduce(o,t,r,n)}function reflect(e){var t=wrapAsync$1(e);return initialParams(function(e,r){return e.push(rest(function(e,t){if(e)r(null,{error:e});else{var n=null;1===t.length?n=t[0]:t.length>1&&(n=t),r(null,{value:n})}})),t.apply(this,e)})}function reject$1(e,t,r,n){_filter(e,t,function(e,t){r(e,function(e,r){t(e,!r)})},n)}function reflectAll(e){var t;return isArray(e)?t=arrayMap(e,reflect):(t={},baseForOwn(e,function(e,r){t[r]=reflect.call(this,e)})),t}function constant$1(e){return function(){return e}}function retry(e,t,r){function n(e,t){if("object"==typeof t)e.times=+t.times||i,e.intervalFunc="function"==typeof t.interval?t.interval:constant$1(+t.interval||a),e.errorFilter=t.errorFilter;else{if("number"!=typeof t&&"string"!=typeof t)throw new Error("Invalid arguments for async.retry");e.times=+t||i}}function o(){c(function(e){e&&u++<s.times&&("function"!=typeof s.errorFilter||s.errorFilter(e))?setTimeout(o,s.intervalFunc(u)):r.apply(null,arguments)})}var i=5,a=0,s={times:i,intervalFunc:constant$1(a)};if(arguments.length<3&&"function"==typeof e?(r=t||noop,t=e):(n(s,e),r=r||noop),"function"!=typeof t)throw new Error("Invalid arguments for async.retry");var c=wrapAsync$1(t),u=1;o()}function series(e,t){_parallel(eachOfSeries,e,t)}function sortBy(e,t,r){function n(e,t){var r=e.criteria,n=t.criteria;return r<n?-1:r>n?1:0}var o=wrapAsync$1(t);map(e,function(e,t){o(e,function(r,n){return r?t(r):void t(null,{value:e,criteria:n})})},function(e,t){return e?r(e):void r(null,arrayMap(t.sort(n),baseProperty("value")))})}function timeout(e,t,r){function n(){s||(i.apply(null,arguments),clearTimeout(a))}function o(){var t=e.name||"anonymous",n=new Error('Callback function "'+t+'" timed out.');n.code="ETIMEDOUT",r&&(n.info=r),s=!0,i(n)}var i,a,s=!1,c=wrapAsync$1(e);return initialParams(function(e,r){i=r,a=setTimeout(o,t),c.apply(null,e.concat(n))})}function baseRange(e,t,r,n){for(var o=-1,i=nativeMax$1(nativeCeil((t-e)/(r||1)),0),a=Array(i);i--;)a[n?i:++o]=e,e+=r;return a}function timeLimit(e,t,r,n){var o=wrapAsync$1(r);mapLimit(baseRange(0,e,1),t,o,n)}function transform(e,t,r,n){arguments.length<=3&&(n=r,r=t,t=isArray(e)?[]:{}),n=once(n||noop);var o=wrapAsync$1(r);eachOf(e,function(e,r,n){o(t,e,r,n)},function(e){n(e,t)})}function unmemoize(e){return function(){return(e.unmemoized||e).apply(null,arguments)}}function whilst(e,t,r){r=onlyOnce(r||noop);var n=wrapAsync$1(t);if(!e())return r(null);var o=rest(function(t,i){return t?r(t):e()?n(o):void r.apply(null,[null].concat(i))});n(o)}function until(e,t,r){whilst(function(){return!e.apply(this,arguments)},t,r)}var nativeMax=Math.max,initialParams=function(e){return rest(function(t){var r=t.pop();e.call(this,t,r)})},supportsSymbol="function"==typeof Symbol,wrapAsync$1=supportsAsync()?wrapAsync:identity,freeGlobal="object"==typeof global&&global&&global.Object===Object&&global,freeSelf="object"==typeof self&&self&&self.Object===Object&&self,root=freeGlobal||freeSelf||Function("return this")(),Symbol$1=root.Symbol,objectProto=Object.prototype,hasOwnProperty=objectProto.hasOwnProperty,nativeObjectToString=objectProto.toString,symToStringTag$1=Symbol$1?Symbol$1.toStringTag:void 0,objectProto$1=Object.prototype,nativeObjectToString$1=objectProto$1.toString,nullTag="[object Null]",undefinedTag="[object Undefined]",symToStringTag=Symbol$1?Symbol$1.toStringTag:void 0,asyncTag="[object AsyncFunction]",funcTag="[object Function]",genTag="[object GeneratorFunction]",proxyTag="[object Proxy]",MAX_SAFE_INTEGER=9007199254740991,breakLoop={},iteratorSymbol="function"==typeof Symbol&&Symbol.iterator,getIterator=function(e){return iteratorSymbol&&e[iteratorSymbol]&&e[iteratorSymbol]()},argsTag="[object Arguments]",objectProto$3=Object.prototype,hasOwnProperty$2=objectProto$3.hasOwnProperty,propertyIsEnumerable=objectProto$3.propertyIsEnumerable,isArguments=baseIsArguments(function(){return arguments}())?baseIsArguments:function(e){return isObjectLike(e)&&hasOwnProperty$2.call(e,"callee")&&!propertyIsEnumerable.call(e,"callee")},isArray=Array.isArray,freeExports="object"==typeof exports&&exports&&!exports.nodeType&&exports,freeModule=freeExports&&"object"==typeof module&&module&&!module.nodeType&&module,moduleExports=freeModule&&freeModule.exports===freeExports,Buffer=moduleExports?root.Buffer:void 0,nativeIsBuffer=Buffer?Buffer.isBuffer:void 0,isBuffer=nativeIsBuffer||stubFalse,MAX_SAFE_INTEGER$1=9007199254740991,reIsUint=/^(?:0|[1-9]\d*)$/,argsTag$1="[object Arguments]",arrayTag="[object Array]",boolTag="[object Boolean]",dateTag="[object Date]",errorTag="[object Error]",funcTag$1="[object Function]",mapTag="[object Map]",numberTag="[object Number]",objectTag="[object Object]",regexpTag="[object RegExp]",setTag="[object Set]",stringTag="[object String]",weakMapTag="[object WeakMap]",arrayBufferTag="[object ArrayBuffer]",dataViewTag="[object DataView]",float32Tag="[object Float32Array]",float64Tag="[object Float64Array]",int8Tag="[object Int8Array]",int16Tag="[object Int16Array]",int32Tag="[object Int32Array]",uint8Tag="[object Uint8Array]",uint8ClampedTag="[object Uint8ClampedArray]",uint16Tag="[object Uint16Array]",uint32Tag="[object Uint32Array]",typedArrayTags={};typedArrayTags[float32Tag]=typedArrayTags[float64Tag]=typedArrayTags[int8Tag]=typedArrayTags[int16Tag]=typedArrayTags[int32Tag]=typedArrayTags[uint8Tag]=typedArrayTags[uint8ClampedTag]=typedArrayTags[uint16Tag]=typedArrayTags[uint32Tag]=!0,typedArrayTags[argsTag$1]=typedArrayTags[arrayTag]=typedArrayTags[arrayBufferTag]=typedArrayTags[boolTag]=typedArrayTags[dataViewTag]=typedArrayTags[dateTag]=typedArrayTags[errorTag]=typedArrayTags[funcTag$1]=typedArrayTags[mapTag]=typedArrayTags[numberTag]=typedArrayTags[objectTag]=typedArrayTags[regexpTag]=typedArrayTags[setTag]=typedArrayTags[stringTag]=typedArrayTags[weakMapTag]=!1;var freeExports$1="object"==typeof exports&&exports&&!exports.nodeType&&exports,freeModule$1=freeExports$1&&"object"==typeof module&&module&&!module.nodeType&&module,moduleExports$1=freeModule$1&&freeModule$1.exports===freeExports$1,freeProcess=moduleExports$1&&freeGlobal.process,nodeUtil=function(){try{return freeProcess&&freeProcess.binding("util")}catch(e){}}(),nodeIsTypedArray=nodeUtil&&nodeUtil.isTypedArray,isTypedArray=nodeIsTypedArray?baseUnary(nodeIsTypedArray):baseIsTypedArray,objectProto$2=Object.prototype,hasOwnProperty$1=objectProto$2.hasOwnProperty,objectProto$5=Object.prototype,nativeKeys=overArg(Object.keys,Object),objectProto$4=Object.prototype,hasOwnProperty$3=objectProto$4.hasOwnProperty,eachOfGeneric=doLimit(eachOfLimit,1/0),eachOf=function(e,t,r){var n=isArrayLike(e)?eachOfArrayLike:eachOfGeneric;n(e,wrapAsync$1(t),r)},map=doParallel(_asyncMap),applyEach=applyEach$1(map),mapLimit=doParallelLimit(_asyncMap),mapSeries=doLimit(mapLimit,1),applyEachSeries=applyEach$1(mapSeries),apply$2=rest(function(e,t){return rest(function(r){return e.apply(null,t.concat(r))})}),baseFor=createBaseFor(),auto=function(e,t,r){function n(e,t){g.push(function(){s(e,t)})}function o(){if(0===g.length&&0===y)return r(null,p);for(;g.length&&y<t;){var e=g.shift();e()}}function i(e,t){var r=d[e];r||(r=d[e]=[]),r.push(t)}function a(e){var t=d[e]||[];arrayEach(t,function(e){e()}),o()}function s(e,t){if(!m){var n=onlyOnce(rest(function(t,n){if(y--,n.length<=1&&(n=n[0]),t){var o={};baseForOwn(p,function(e,t){o[t]=e}),o[e]=n,m=!0,d=Object.create(null),r(t,o)}else p[e]=n,a(e)}));y++;var o=wrapAsync$1(t[t.length-1]);t.length>1?o(p,n):o(n)}}function c(){for(var e,t=0;h.length;)e=h.pop(),t++,arrayEach(u(e),function(e){0===--b[e]&&h.push(e)});if(t!==f)throw new Error("async.auto cannot execute tasks due to a recursive dependency")}function u(t){var r=[];return baseForOwn(e,function(e,n){isArray(e)&&baseIndexOf(e,t,0)>=0&&r.push(n)}),r}"function"==typeof t&&(r=t,t=null),r=once(r||noop);var l=keys(e),f=l.length;if(!f)return r(null);t||(t=f);var p={},y=0,m=!1,d=Object.create(null),g=[],h=[],b={};baseForOwn(e,function(t,r){if(!isArray(t))return n(r,[t]),void h.push(r);var o=t.slice(0,t.length-1),a=o.length;return 0===a?(n(r,t),void h.push(r)):(b[r]=a,void arrayEach(o,function(s){if(!e[s])throw new Error("async.auto task `"+r+"` has a non-existent dependency `"+s+"` in "+o.join(", "));i(s,function(){a--,0===a&&n(r,t)})}))}),c(),o()},symbolTag="[object Symbol]",INFINITY=1/0,symbolProto=Symbol$1?Symbol$1.prototype:void 0,symbolToString=symbolProto?symbolProto.toString:void 0,rsAstralRange="\\ud800-\\udfff",rsComboMarksRange="\\u0300-\\u036f\\ufe20-\\ufe23",rsComboSymbolsRange="\\u20d0-\\u20f0",rsVarRange="\\ufe0e\\ufe0f",rsZWJ="\\u200d",reHasUnicode=RegExp("["+rsZWJ+rsAstralRange+rsComboMarksRange+rsComboSymbolsRange+rsVarRange+"]"),rsAstralRange$1="\\ud800-\\udfff",rsComboMarksRange$1="\\u0300-\\u036f\\ufe20-\\ufe23",rsComboSymbolsRange$1="\\u20d0-\\u20f0",rsVarRange$1="\\ufe0e\\ufe0f",rsAstral="["+rsAstralRange$1+"]",rsCombo="["+rsComboMarksRange$1+rsComboSymbolsRange$1+"]",rsFitz="\\ud83c[\\udffb-\\udfff]",rsModifier="(?:"+rsCombo+"|"+rsFitz+")",rsNonAstral="[^"+rsAstralRange$1+"]",rsRegional="(?:\\ud83c[\\udde6-\\uddff]){2}",rsSurrPair="[\\ud800-\\udbff][\\udc00-\\udfff]",rsZWJ$1="\\u200d",reOptMod=rsModifier+"?",rsOptVar="["+rsVarRange$1+"]?",rsOptJoin="(?:"+rsZWJ$1+"(?:"+[rsNonAstral,rsRegional,rsSurrPair].join("|")+")"+rsOptVar+reOptMod+")*",rsSeq=rsOptVar+reOptMod+rsOptJoin,rsSymbol="(?:"+[rsNonAstral+rsCombo+"?",rsCombo,rsRegional,rsSurrPair,rsAstral].join("|")+")",reUnicode=RegExp(rsFitz+"(?="+rsFitz+")|"+rsSymbol+rsSeq,"g"),reTrim=/^\s+|\s+$/g,FN_ARGS=/^(?:async\s+)?(function)?\s*[^\(]*\(\s*([^\)]*)\)/m,FN_ARG_SPLIT=/,/,FN_ARG=/(=.+)?(\s*)$/,STRIP_COMMENTS=/((\/\/.*$)|(\/\*[\s\S]*?\*\/))/gm,hasSetImmediate="function"==typeof setImmediate&&setImmediate,hasNextTick="object"==typeof process&&"function"==typeof process.nextTick,_defer;_defer=hasSetImmediate?setImmediate:hasNextTick?process.nextTick:fallback;var setImmediate$1=wrap(_defer);DLL.prototype.removeLink=function(e){return e.prev?e.prev.next=e.next:this.head=e.next,e.next?e.next.prev=e.prev:this.tail=e.prev,e.prev=e.next=null,this.length-=1,e},DLL.prototype.empty=DLL,DLL.prototype.insertAfter=function(e,t){t.prev=e,t.next=e.next,e.next?e.next.prev=t:this.tail=t,e.next=t,this.length+=1},DLL.prototype.insertBefore=function(e,t){t.prev=e.prev,t.next=e,e.prev?e.prev.next=t:this.head=t,e.prev=t,this.length+=1},DLL.prototype.unshift=function(e){this.head?this.insertBefore(this.head,e):setInitial(this,e)},DLL.prototype.push=function(e){this.tail?this.insertAfter(this.tail,e):setInitial(this,e)},DLL.prototype.shift=function(){return this.head&&this.removeLink(this.head)},DLL.prototype.pop=function(){return this.tail&&this.removeLink(this.tail)};var eachOfSeries=doLimit(eachOfLimit,1),seq$1=rest(function(e){var t=arrayMap(e,wrapAsync$1);return rest(function(e){var r=this,n=e[e.length-1];"function"==typeof n?e.pop():n=noop,reduce(t,e,function(e,t,n){t.apply(r,e.concat(rest(function(e,t){n(e,t)})))},function(e,t){n.apply(r,[e].concat(t))})})}),compose=rest(function(e){return seq$1.apply(null,e.reverse())}),concat=doParallel(concat$1),concatSeries=doSeries(concat$1),constant=rest(function(e){var t=[null].concat(e);return initialParams(function(e,r){return r.apply(this,t)})}),detect=doParallel(_createTester(identity,_findGetResult)),detectLimit=doParallelLimit(_createTester(identity,_findGetResult)),detectSeries=doLimit(detectLimit,1),dir=consoleFunc("dir"),eachSeries=doLimit(eachLimit$1,1),every=doParallel(_createTester(notId,notId)),everyLimit=doParallelLimit(_createTester(notId,notId)),everySeries=doLimit(everyLimit,1),filter=doParallel(_filter),filterLimit=doParallelLimit(_filter),filterSeries=doLimit(filterLimit,1),groupByLimit=function(e,t,r,n){n=n||noop;var o=wrapAsync$1(r);mapLimit(e,t,function(e,t){o(e,function(r,n){return r?t(r):t(null,{key:n,val:e})})},function(e,t){for(var r={},o=Object.prototype.hasOwnProperty,i=0;i<t.length;i++)if(t[i]){var a=t[i].key,s=t[i].val;o.call(r,a)?r[a].push(s):r[a]=[s]}return n(e,r)})},groupBy=doLimit(groupByLimit,1/0),groupBySeries=doLimit(groupByLimit,1),log=consoleFunc("log"),mapValues=doLimit(mapValuesLimit,1/0),mapValuesSeries=doLimit(mapValuesLimit,1),_defer$1;_defer$1=hasNextTick?process.nextTick:hasSetImmediate?setImmediate:fallback;var nextTick=wrap(_defer$1),queue$1=function(e,t){var r=wrapAsync$1(e);return queue(function(e,t){r(e[0],t)},t,1)},priorityQueue=function(e,t){var r=queue$1(e,t);return r.push=function(e,t,n){if(null==n&&(n=noop),"function"!=typeof n)throw new Error("task callback must be a function");if(r.started=!0,isArray(e)||(e=[e]),0===e.length)return setImmediate$1(function(){r.drain()});t=t||0;for(var o=r._tasks.head;o&&t>=o.priority;)o=o.next;for(var i=0,a=e.length;i<a;i++){var s={data:e[i],priority:t,callback:n};o?r._tasks.insertBefore(o,s):r._tasks.push(s)}setImmediate$1(r.process)},delete r.unshift,r},slice=Array.prototype.slice,reject=doParallel(reject$1),rejectLimit=doParallelLimit(reject$1),rejectSeries=doLimit(rejectLimit,1),retryable=function(e,t){t||(t=e,e=null);var r=wrapAsync$1(t);return initialParams(function(t,n){function o(e){r.apply(null,t.concat(e))}e?retry(e,o,n):retry(o,n)})},some=doParallel(_createTester(Boolean,identity)),someLimit=doParallelLimit(_createTester(Boolean,identity)),someSeries=doLimit(someLimit,1),nativeCeil=Math.ceil,nativeMax$1=Math.max,times=doLimit(timeLimit,1/0),timesSeries=doLimit(timeLimit,1),waterfall=function(e,t){function r(o){if(n===e.length)return t.apply(null,[null].concat(o));var i=onlyOnce(rest(function(e,n){return e?t.apply(null,[e].concat(n)):void r(n)}));o.push(i);var a=wrapAsync$1(e[n++]);a.apply(null,o)}if(t=once(t||noop),!isArray(e))return t(new Error("First argument to waterfall must be an array of functions"));if(!e.length)return t();var n=0;r([])},index={applyEach:applyEach,applyEachSeries:applyEachSeries,apply:apply$2,asyncify:asyncify,auto:auto,autoInject:autoInject,cargo:cargo,compose:compose,concat:concat,concatSeries:concatSeries,constant:constant,detect:detect,detectLimit:detectLimit,detectSeries:detectSeries,dir:dir,doDuring:doDuring,doUntil:doUntil,doWhilst:doWhilst,during:during,each:eachLimit,eachLimit:eachLimit$1,eachOf:eachOf,eachOfLimit:eachOfLimit,eachOfSeries:eachOfSeries,eachSeries:eachSeries,ensureAsync:ensureAsync,every:every,everyLimit:everyLimit,everySeries:everySeries,filter:filter,filterLimit:filterLimit,filterSeries:filterSeries,forever:forever,groupBy:groupBy,groupByLimit:groupByLimit,groupBySeries:groupBySeries,log:log,map:map,mapLimit:mapLimit,mapSeries:mapSeries,mapValues:mapValues,mapValuesLimit:mapValuesLimit,mapValuesSeries:mapValuesSeries,memoize:memoize,nextTick:nextTick,parallel:parallelLimit,parallelLimit:parallelLimit$1,priorityQueue:priorityQueue,queue:queue$1,race:race,reduce:reduce,reduceRight:reduceRight,reflect:reflect,reflectAll:reflectAll,reject:reject,rejectLimit:rejectLimit,rejectSeries:rejectSeries,retry:retry,retryable:retryable,seq:seq$1,series:series,setImmediate:setImmediate$1,some:some,someLimit:someLimit,someSeries:someSeries,sortBy:sortBy,timeout:timeout,times:times,timesLimit:timeLimit,timesSeries:timesSeries,transform:transform,unmemoize:unmemoize,until:until,waterfall:waterfall,whilst:whilst,all:every,any:some,forEach:eachLimit,forEachSeries:eachSeries,forEachLimit:eachLimit$1,forEachOf:eachOf,forEachOfSeries:eachOfSeries,forEachOfLimit:eachOfLimit,inject:reduce,foldl:reduce,foldr:reduceRight,select:filter,selectLimit:filterLimit,selectSeries:filterSeries,wrapSync:asyncify};exports.default=index,exports.applyEach=applyEach,exports.applyEachSeries=applyEachSeries,exports.apply=apply$2,exports.asyncify=asyncify,exports.auto=auto,exports.autoInject=autoInject,exports.cargo=cargo,exports.compose=compose,exports.concat=concat,exports.concatSeries=concatSeries,exports.constant=constant,exports.detect=detect,exports.detectLimit=detectLimit,exports.detectSeries=detectSeries,exports.dir=dir,exports.doDuring=doDuring,exports.doUntil=doUntil,exports.doWhilst=doWhilst,exports.during=during,exports.each=eachLimit,exports.eachLimit=eachLimit$1,exports.eachOf=eachOf,exports.eachOfLimit=eachOfLimit,exports.eachOfSeries=eachOfSeries,exports.eachSeries=eachSeries,exports.ensureAsync=ensureAsync,exports.every=every,exports.everyLimit=everyLimit,exports.everySeries=everySeries,exports.filter=filter,exports.filterLimit=filterLimit,exports.filterSeries=filterSeries,exports.forever=forever,exports.groupBy=groupBy,exports.groupByLimit=groupByLimit,exports.groupBySeries=groupBySeries,exports.log=log,exports.map=map,exports.mapLimit=mapLimit,exports.mapSeries=mapSeries,exports.mapValues=mapValues,exports.mapValuesLimit=mapValuesLimit,exports.mapValuesSeries=mapValuesSeries,exports.memoize=memoize,exports.nextTick=nextTick,exports.parallel=parallelLimit,exports.parallelLimit=parallelLimit$1,exports.priorityQueue=priorityQueue,exports.queue=queue$1,exports.race=race,exports.reduce=reduce,exports.reduceRight=reduceRight,exports.reflect=reflect,exports.reflectAll=reflectAll,exports.reject=reject,exports.rejectLimit=rejectLimit,exports.rejectSeries=rejectSeries,exports.retry=retry,exports.retryable=retryable,exports.seq=seq$1,exports.series=series,exports.setImmediate=setImmediate$1,exports.some=some,exports.someLimit=someLimit,exports.someSeries=someSeries,exports.sortBy=sortBy,exports.timeout=timeout,exports.times=times,exports.timesLimit=timeLimit,exports.timesSeries=timesSeries,exports.transform=transform,exports.unmemoize=unmemoize,exports.until=until,exports.waterfall=waterfall,exports.whilst=whilst,exports.all=every,exports.allLimit=everyLimit,exports.allSeries=everySeries,exports.any=some,exports.anyLimit=someLimit,exports.anySeries=someSeries,exports.find=detect,exports.findLimit=detectLimit,exports.findSeries=detectSeries,exports.forEach=eachLimit,exports.forEachSeries=eachSeries,exports.forEachLimit=eachLimit$1,exports.forEachOf=eachOf,exports.forEachOfSeries=eachOfSeries,exports.forEachOfLimit=eachOfLimit,exports.inject=reduce,exports.foldl=reduce,exports.foldr=reduceRight,exports.select=filter,exports.selectLimit=filterLimit,exports.selectSeries=filterSeries,exports.wrapSync=asyncify,Object.defineProperty(exports,"__esModule",{value:!0})});
//# sourceMappingURL=async.min.map;
require([
    "modules/jquery-mozu",
    "underscore",
    "bxslider",
    "elevatezoom",
    'modules/block-ui',
    "hyprlive",
    "modules/backbone-mozu",
    "modules/cart-monitor",
    "modules/models-product",
    "modules/views-productimages",
    "hyprlivecontext",
    "pages/family",
    "modules/api",
    "async",
    "modules/metrics"
], function($, _, bxslider, elevatezoom, blockUiLoader, Hypr, Backbone, CartMonitor, ProductModels, ProductImageViews, HyprLiveContext, FamilyItemView, api, async, MetricsEngine) {
    var sitecontext = HyprLiveContext.locals.siteContext;
    var cdn = sitecontext.cdnPrefix;
    var siteID = cdn.substring(cdn.lastIndexOf('-') + 1);
    var imagefilepath = cdn + '/cms/' + siteID + '/files';
    var slider;
    var slider_mobile;
    var productInitialImages;
    var priceModel;
    var width_thumb = HyprLiveContext.locals.themeSettings.maxProductImageThumbnailSize;
    var width_pdp = HyprLiveContext.locals.themeSettings.productImagePdpMaxWidth;
    var width_zoom = HyprLiveContext.locals.themeSettings.productZoomImageMaxWidth;
    var colorSwatchesChangeAlternate = HyprLiveContext.locals.themeSettings.colorSwatchesChangeAlternate;
    var colorSwatchesChangeMain = HyprLiveContext.locals.themeSettings.colorSwatchesChangeMain;
    var current_zoom_id_added;
    var deviceType = navigator.userAgent.match(/Android|BlackBerry|iPhone|iPod|Opera Mini|IEMobile/i);

    function initSlider() {
        slider = $('#productpager-Carousel').bxSlider({
            slideWidth: 90,
            minSlides: 4,
            maxSlides: 4,
            moveSlides: 1,
            slideMargin: 15,
            nextText: '<i class="fa fa-angle-right" aria-hidden="true"></i>',
            prevText: '<i class="fa fa-angle-left" aria-hidden="true"></i>',
            infiniteLoop: false,
            hideControlOnEnd: true,
            pager: false
        });
        window.slider = slider;
    }

    function initslider_mobile() {
        var id;
        if (current_zoom_id_added)
            id = $(current_zoom_id_added)[0].attributes.id.value.replace('zoom_', '') - 1;
        slider_mobile = $('#productmobile-Carousel').bxSlider({
            slideWidth: 300,
            minSlides: 1,
            maxSlides: 1,
            moveSlides: 1,
            preloadImages: 'all',
            onSliderLoad: function(currentIndex) {
                $('ul#productmobile-Carousel li').eq(currentIndex).find('img').addClass("active");
                $("#productmobile-Carousel,#productCarousel-pager").css("visibility", "visible");
            },
            onSlideAfter: function($slideElement, oldIndex, newIndex) {
                $('.zoomContainer').remove();
                current_zoom_id_added.elevateZoom({ zoomType: "inner", cursor: "crosshair" }).addClass('active');
                var bkimg = $(current_zoom_id_added)[0].attributes['data-zoom-image'].value;
                $(".mz-productimages-pager div").removeClass("activepager").eq(newIndex).addClass("activepager");
                setTimeout(function() {
                    $('div.zoomWindowContainer div').css({ 'background-image': 'url(' + bkimg + ')' });
                }, 500);

            },
            onSlideBefore: function(currentSlide, totalSlides, currentSlideHtmlObject) {
                var current_zoom_id = '#' + $('#productmobile-Carousel>li').eq(currentSlideHtmlObject).find('img').attr('id');
                $('.zoomContainer').remove();
                $(current_zoom_id).removeData('elevateZoom');
                current_zoom_id_added = $('#productmobile-Carousel>li').eq(currentSlideHtmlObject).find('img');
                $('ul#productmobile-Carousel li img').removeClass('active');
            },
            startSlide: id ? id : 0,
            nextText: '<i class="fa fa-angle-right" aria-hidden="true"></i>',
            prevText: '<i class="fa fa-angle-left" aria-hidden="true"></i>',
            infiniteLoop: false,
            hideControlOnEnd: true,
            pager: true,
            pagerCustom: '#productCarousel-pager'
        });
    }

    //using GET request CheckImage function checks whether an image exist or not
    var checkImage = function(imagepath, callback) {
        $.get(imagepath).done(function() {
            callback(true); //return true if image exist
        }).error(function() {
            callback(false);
        });
    };


    function updateImages(productInitialImages) {
        var mainImage = productInitialImages.mainImage.src + '?maxWidth=' + width_pdp;
        var zoomImage = productInitialImages.mainImage.src + '?maxWidth=' + width_zoom;
        $('body div.zoomContainer').remove();
        $('#zoom').removeData('elevateZoom');
        $('.mz-productimages-mainimage').attr('src', mainImage).data('zoom-image', zoomImage);
        $('#zoom').elevateZoom({ zoomType: "inner", cursor: "crosshair" });
        try {
            slider.destroySlider();
        } catch (e) {}
        var slideCount = productInitialImages.thumbImages.length;
        for (var i = 1; i <= productInitialImages.thumbImages.length; i++) {
            $(".mz-productimages-thumbs li:eq(" + (i - 1) + ") .mz-productimages-thumb img")
                .attr({
                    "src": productInitialImages.thumbImages[i - 1].src + '?maxWidth=' + width_thumb,
                    "data-orig-src": productInitialImages.thumbImages[i - 1].src + '?maxWidth=' + width_pdp,
                    "data-orig-zoom": productInitialImages.thumbImages[i - 1].src + '?maxWidth=' + width_zoom
                });
        }
        if (slideCount > 4) {
            initSlider();
        }
        initslider_mobile();
    }
    window.family = [];
    var ProductView = Backbone.MozuView.extend({
        requiredBehaviors: [1014],
        templateName: 'modules/product/product-detail',
        autoUpdate: ['quantity'],
        renderOnChange: [
            'quantity',
            'stockInfo'
        ],
        additionalEvents: {
            "change [data-mz-product-option]": "onOptionChange",
            "blur [data-mz-product-option]": "onOptionChange",
            "click [data-mz-product-option-attribute]": "onOptionChangeAttribute",
            "click [data-mz-qty-minus]": "quantityMinus",
            "click [data-mz-qty-plus]": "quantityPlus",
            'mouseenter .color-options': 'onMouseEnterChangeImage',
            'mouseleave .color-options': 'onMouseLeaveResetImage'
        },
        render: function() {
            var me = this;
            var id = Hypr.getThemeSetting('oneSizeAttributeName'),
                oneSizeOption = this.model.get('options').get(id);
            if (oneSizeOption) {
                var onlyEnabledOneSizeOption = _.find(oneSizeOption.get('values'), function(value) { return value.isEnabled; });
                oneSizeOption.set('value', onlyEnabledOneSizeOption.value);
            }
            Backbone.MozuView.prototype.render.apply(this);
            this.$('[data-mz-is-datepicker]').each(function(ix, dp) {
                $(dp).dateinput().css('color', Hypr.getThemeSetting('textColor')).on('change  blur', _.bind(me.onOptionChangeAttribute, me));
            });
            $('#details-accordion').find('.panel-heading a').first().click();
            $(".family-details [data-mz-action='addToCart']").addClass('hide');
            $(".mz-productdetail-conversion-buttons").removeClass('hide');

            if (this.model.get('productType') === Hypr.getThemeSetting('familyProductType')) {
                try {
                    blockUiLoader.globalLoader();
                    $('.family-details .mz-productdetail-shortdesc, .family-details .stock-info, .family-details .mz-reset-padding-left, .family-details #SelectValidOption').remove();
                    var familyData = me.model.get('family');
                    $("#mz-family-container .family-members").empty();
                    var familyItemModelOnready = function() {
                        var product = familyData.models[this.index];
                        if (typeof product.get('inventoryInfo').onlineStockAvailable !== 'undefined' && product.get('inventoryInfo').onlineStockAvailable === 0 && product.get('inventoryInfo').outOfStockBehavior === "HideProduct") {
                            //if all family members are out of stock, disable add to cart button.
                            if (window.outOfStockFamily) {
                                $(".family-details [data-mz-action='addToCart']").addClass('hide');
                                $("[data-mz-action='addToCart']").addClass('button_disabled').attr("disabled", "disabled");
                            }
                        } else {
                            var productCode = product.get('productCode');
                            var view = new FamilyItemView({
                                model: product,
                                messagesEl: $('#family-item-error-' + productCode + " [data-mz-message-bar]")
                            });
                            window.family.push(view);
                            var renderedView = view.render().el;
                            $("#mz-family-container").find("#" + productCode).append(renderedView);
                            $(".family-details [data-mz-action='addToCart']").removeClass('hide');
                            //if all family members are out of stock, disable add to cart button.
                            if (window.outOfStockFamily) {
                                $("[data-mz-action='addToCart']").addClass('button_disabled').attr("disabled", "disabled");
                            }
                        }
                    };
                    if (familyData.models.length) {
                        for (var i = 0; i < familyData.models.length; i++) {
                            //var x = this.model.checkVariationCode(familyData.models[i]);
                            var familyItemModel = familyData.models[i];
                            if (familyItemModel.get("isReady")) {
                                familyItemModel.off('ready');
                                familyItemModelOnready.call({ index: i });
                            } else {
                                familyItemModel.on('ready', familyItemModelOnready.bind({ index: i }));
                                if (i === (familyData.models.length - 1)) {
                                    blockUiLoader.unblockUi();
                                }
                            }
                        }
                    } else {
                        $(".family-details [data-mz-action='addToCart']").addClass('hide');
                        $("[data-mz-action='addToCart']").addClass('button_disabled').attr("disabled", "disabled");
                        blockUiLoader.unblockUi();
                    }
                } catch (e) {}
            }
        },
        quantityMinus: function() {
            this.model.messages.reset();
            var qty = this.model.get('quantity');
            if (qty === 1) {
                return;
            }
            this.model.set('quantity',--qty);
            setTimeout(function(){
                if (typeof window.productView.model.attributes.inventoryInfo.onlineStockAvailable !== "undefined" && window.productView.model.attributes.inventoryInfo.outOfStockBehavior != "AllowBackOrder") {
                    var onlineStock = window.productView.model.attributes.inventoryInfo.onlineStockAvailable;
                    if (onlineStock >= window.productView.model.get('quantity')) {
                        $("[data-mz-action='addToCart']").removeClass("button_disabled");
                        $('#plus').removeClass('disabled btn-disable-color');
                    }
                    if (onlineStock !== 0 && onlineStock < window.productView.model.get('quantity')) {
                        $('[data-mz-validationmessage-for="quantity"]').css('visibility', "visible").text("*Only " + onlineStock + " left in stock.");
                        $("[data-mz-action='addToCart']").addClass("button_disabled");
                        $('#plus').addClass('disabled btn-disable-color');
                    }
                }
            },500);
        },
        quantityPlus: function() {
            if(!$("#plus").hasClass('disabled')){
                this.model.messages.reset();
                var qty = this.model.get('quantity');
                this.model.set('quantity',++qty);
                setTimeout(function(){
                    if (typeof window.productView.model.attributes.inventoryInfo.onlineStockAvailable !== "undefined" && window.productView.model.attributes.inventoryInfo.outOfStockBehavior != "AllowBackOrder") {
                        var onlineStock = window.productView.model.attributes.inventoryInfo.onlineStockAvailable;
                        if (onlineStock < window.productView.model.get('quantity')) {
                            $('[data-mz-validationmessage-for="quantity"]').css('visibility', "visible").text("*Only " + onlineStock + " left in stock.");
                            $("[data-mz-action='addToCart']").addClass("button_disabled");
                            $('#plus').addClass('disabled btn-disable-color');
                        }
                        if (onlineStock >= window.productView.model.get('quantity')) {
                            $("[data-mz-action='addToCart']").removeClass("button_disabled");
                        }
                    }
                },500);
            }
        },
        onOptionChangeAttribute: function(e) {
            return this.configureAttribute($(e.currentTarget));
        },
        configureAttribute: function($optionEl) {
            var $this = this;
            if (!$optionEl.hasClass("active")) {
                if ($optionEl.attr('disabled') == 'disabled') {
                    return false;
                } else {
                    blockUiLoader.globalLoader();
                    var newValue = $optionEl.data('value'),
                        oldValue,
                        id = $optionEl.data('mz-product-option-attribute'),
                        optionEl = $optionEl[0],
                        isPicked = (optionEl.type !== "checkbox" && optionEl.type !== "radio") || optionEl.checked,
                        option = this.model.get('options').get(id);
                    if (!option) {
                        var byIDVal = JSON.parse(JSON.stringify(this.model.get('options')._byId));
                        for (var key in byIDVal) {
                            if (id === byIDVal[key].attributeFQN) {
                                option = this.model.get('options').get(key);
                            }
                        }
                    }
                    if (option) {
                        if (option.get('attributeDetail').inputType === "YesNo") {
                            option.set("value", isPicked);
                        } else if (isPicked) {
                            oldValue = option.get('value');
                            if (oldValue !== newValue && !(oldValue === undefined && newValue === '')) {
                                option.set('value', newValue);
                                this.render();
                            }
                        }
                    }
                    this.model.whenReady(function() {
                        setTimeout(function() {
                            if (window.productView.model.get('variationProductCode') && typeof window.productView.model.get('variationProductCode') !== "undefined") {
                                $(".mz-productcodes-productcode").text(Hypr.getLabel('sku')+" # " + window.productView.model.get('variationProductCode'));
                            }
                            $('.mz-productdetail-price.prize-mobile-view').html($('.mz-l-stack-section.mz-productdetail-conversion .mz-productdetail-price').html());
                            blockUiLoader.unblockUi();
                            $this.isColorClicked = false;
                        }, 1000);
                    });
                }
            }
        },
        onOptionChange: function(e) {
            return this.configure($(e.currentTarget));
        },
        configure: function($optionEl) {
            var newValue = $optionEl.val(),
                oldValue,
                id = $optionEl.data('mz-product-option'),
                optionEl = $optionEl[0],
                isPicked = (optionEl.type !== "checkbox" && optionEl.type !== "radio") || optionEl.checked,
                option = this.model.get('options').get(id);
            if (option) {
                if (option.get('attributeDetail').inputType === "YesNo") {
                    option.set("value", isPicked);
                } else if (isPicked) {
                    oldValue = option.get('value');
                    if (oldValue !== newValue && !(oldValue === undefined && newValue === '')) {
                        option.set('value', newValue);
                    }
                }
            }
        },
        addToCart: _.debounce(function() {
            var me = this;
            me.model.messages.reset();
            //If Family Products
            if (this.model.get('productType') === Hypr.getThemeSetting('familyProductType')) {
                blockUiLoader.globalLoader();
                /* jshint ignore:start */
                var promises = [];
                var productsAdded = [];
                for (var i = 0; i < this.model.get('family').models.length; i++) {
                    promises.push((function(callback) {
                        var familyItem = me.model.get('family').models[this.index];
                        var productCode = familyItem.get('productCode');
                        familyItem.addToCart().then(function(e) {
                            //Clear options and set Qty to 0
                            for (var j = 0; j < window.family.length; j++) {
                                if (window.family[j].model.get('productCode') === productCode) {
                                    var optionModels = window.family[j].model.get('options').models;
                                    for (var k = 0; k < optionModels.length; k++) {
                                        optionModels[k].unset('value');
                                    }
                                    window.family[j].model.set('quantity', 0);
                                    window.family[j].model.unset('stockInfo');
                                    window.family[j].model.set('addedtocart', true);
                                }
                            }
                            productsAdded.push(e);
                            callback(null, e);
                        }, function(e) {
                            callback(null, e);
                        });
                    }).bind({ index: i }))
                }
                var errors = { "items": [] };
                async.series(promises, function(err, results) {
                        var resp = results.reduce(
                            function(flag, value) {
                                return flag && results[0] === value;
                            },
                            true
                        );
                        if (resp === true) {
                            window.productView.model.trigger('error', { message: Hypr.getLabel('selectValidOption') });
                            blockUiLoader.unblockUi();
                            return;
                        }
                        if (results) {
                            var failureNames = [];
                            var successNames = [];
                            for (var i = 0; i < results.length; i++) {
                                if (results[i].errorCode) {
                                    var errorMessage = results[i].message.split(':');
                                    failureNames.push(errorMessage[2]);
                                } else if (typeof results[i].attributes === 'undefined' && results[i].indexOf("Please enter quantity of ") !== -1) {
                                    failureNames.push(results[i]);
                                } else if (typeof results[i].attributes === 'undefined' && results[i].indexOf("Select Valid Option(s) for ") !== -1) {
                                    failureNames.push(results[i]);
                                } else if (typeof results[i].attributes !== 'undefined') {
                                    successNames.push(results[i].get('content').get('productName'));
                                }
                            }
                            if (failureNames.length) {
                                errors.items.push({
                                    "name": "error",
                                    "message": Hypr.getLabel('productaddToCartError') + ": " + failureNames.join(', ')
                                });
                            }
                            if (successNames.length) {
                                errors.items.push({
                                    "name": 'success',
                                    "message": Hypr.getLabel('successfullyAddedItems') + ": " + successNames.join(', '),
                                    "messageType": "success"
                                });
                            }
                            if (failureNames.length || successNames.length)
                                me.model.trigger("error", errors);
                        }
                        if (productsAdded.length)
                            CartMonitor.update('showGlobalCart');
                        if (!deviceType) {
                            $('html,body').animate({
                                scrollTop: $('figure.mz-productimages-main').offset().top
                            }, 1000);
                        } else {
                            $('html,body').animate({
                                scrollTop: $('.mz-product-top-content').offset().top
                            }, 1000);
                        }
                        blockUiLoader.unblockUi();
                    })
                    /* jshint ignore:end */
            }else if(typeof me.model.get('inventoryInfo').onlineStockAvailable !== 'undefined' && me.model.get('inventoryInfo').outOfStockBehavior === "AllowBackOrder"){
                me.model.addToCart();
            }else if (typeof me.model.get('inventoryInfo').onlineStockAvailable !== "undefined" && me.model.get('inventoryInfo').onlineStockAvailable === 0 && me.model.get('inventoryInfo').outOfStockBehavior === "DisplayMessage") {
                blockUiLoader.productValidationMessage();
                $('#SelectValidOption').children('span').html(Hypr.getLabel('productOutOfStock'));
            }else if (typeof me.model.get('inventoryInfo').onlineStockAvailable === "undefined" || $(".mz-productoptions-optioncontainer").length != $(".mz-productoptions-optioncontainer .active").length) {
                blockUiLoader.productValidationMessage();
            } else if (me.model.get('inventoryInfo').onlineStockAvailable) {
                if (me.model.get('inventoryInfo').onlineStockAvailable < me.model.get('quantity')) {
                    $('[data-mz-validationmessage-for="quantity"]').css('visibility', "visible").text("*Only " + me.model.get('inventoryInfo').onlineStockAvailable + " left in stock.");
                    return false;
                }
                this.model.addToCart();
            }
        }, 1500),
        addToWishlist: function() {
            this.model.addToWishlist();
        },
        checkLocalStores: function(e) {
            var me = this;
            e.preventDefault();
            this.model.whenReady(function() {
                var $localStoresForm = $(e.currentTarget).parents('[data-mz-localstoresform]'),
                    $input = $localStoresForm.find('[data-mz-localstoresform-input]');
                if ($input.length > 0) {
                    $input.val(JSON.stringify(me.model.toJSON()));
                    $localStoresForm[0].submit();
                }
            });

        },
        onMouseEnterChangeImage: function(_e) {
            if (!deviceType) {
                this.mainImage = $('.mz-productimages-mainimage').attr('src');
                var colorCode = $(_e.currentTarget).data('mz-swatch-color');
                this.changeImages(colorCode, 'N');
            }
        },
        onMouseLeaveResetImage: function(_e) {
            if (!this.isColorClicked && !deviceType) {
                var colorCode = $("ul.product-color-swatches").find('li.active').data('mz-swatch-color');
                if (typeof colorCode != 'undefined') {
                    this.changeImages(colorCode, 'N');
                } else if (typeof this.mainImage != 'undefined') {
                    $('.mz-productimages-mainimage').attr('src', this.mainImage);
                } else {
                    $('.mz-productimages-main').html('<span class="mz-productlisting-imageplaceholder img-responsive"><span class="mz-productlisting-imageplaceholdertext">[no image]</span></span>');
                }
            }
        },
        selectSwatch: function(e) {
            this.isColorClicked = true;
            var colorCode = $(e.currentTarget).data('mz-swatch-color');
            if(colorSwatchesChangeAlternate)
                this.changeImages(colorCode, 'Y');
            else
                this.changeImages(colorCode, 'N');
        },
        changeImages: function(colorCode, _updateThumbNails) {
            var self = this;
            var version = 1;
            if (deviceType && $("figure.mz-productimages-thumbs ul.products_list_mobile li img.active").length > 0) {
                version = $("figure.mz-productimages-thumbs ul.products_list_mobile li img.active").data("mz-productimage-mobile");
            } else if ($("figure.mz-productimages-thumbs ul.products_list li.active").length > 0) {
                version = $("figure.mz-productimages-thumbs ul.products_list li.active").data("mz-productimage-thumb");
            }
            var pdpMainImageNameSwatch = HyprLiveContext.locals.themeSettings.pdpMainImageNameSwatch;
            if(pdpMainImageNameSwatch){
                if(pdpMainImageNameSwatch.indexOf("{0}") != -1){
                    pdpMainImageNameSwatch = pdpMainImageNameSwatch.replace("{0}", this.model.attributes.productCode);
                }
                if(pdpMainImageNameSwatch.indexOf("{1}") != -1){
                    pdpMainImageNameSwatch = pdpMainImageNameSwatch.replace("{1}", colorCode);
                }
                if(pdpMainImageNameSwatch.indexOf("{2}") != -1){
                    pdpMainImageNameSwatch = pdpMainImageNameSwatch.replace("{2}", version);
                }
            }
            var imagepath = imagefilepath + '/' + pdpMainImageNameSwatch +'?maxWidth=';
            var mainImage = imagepath + width_pdp;
            var zoomimagepath = imagepath + width_zoom;
            var _this = this;
            //TODO: following function is checking if images exist on server or not
            checkImage(imagepath, function(response) {
                if (response) {
                    if (!$('#zoom').length) {
                        $('.mz-productimages-main').html('<img class="mz-productimages-mainimage" data-mz-productimage-main="" id="zoom" itemprop="image">');
                    }
                    if (_updateThumbNails == 'Y') {
                        $('body div.zoomContainer').remove();
                        if (deviceType && $('ul.products_list_mobile').length) {
                            //slider_mobile.goToSlide(0);
                            $('body div.zoomContainer').remove();
                            $("img").removeData('elevateZoom');
                            $(current_zoom_id_added).attr('src', imagepath).data('zoom-image', zoomimagepath).elevateZoom({ zoomType: "inner", cursor: "crosshair" });
                        } else {
                            $('#zoom').removeData('elevateZoom');
                            $('.mz-productimages-mainimage').attr('src', mainImage).data('zoom-image', zoomimagepath);
                            $('#zoom').elevateZoom({ zoomType: "inner", cursor: "crosshair" });
                            $('.mz-productimages-mainimage').attr('src', mainImage);
                        }
                    } else {
                        $('.mz-productimages-mainimage').attr('src', mainImage);
                    }
                } else if (typeof self.mainImage === 'undefined') {
                    $('.mz-productimages-main').html('<span class="mz-productlisting-imageplaceholder img-responsive"><span class="mz-productlisting-imageplaceholdertext">[no image]</span></span>');
                }
                if ($("figure.mz-productimages-thumbs").length && $("figure.mz-productimages-thumbs").data("length") && _updateThumbNails == 'Y') {
                    _this.updateAltImages(colorCode);
                }
            });
        },
        updateAltImages: function(colorCode) {
            try {
                slider.destroySlider();
            } catch (e) {}
            try {
                slider_mobile.destroySlider();
            } catch (e) {}
            var slideCount = parseInt($("figure.mz-productimages-thumbs").data("length"), 10);
            var productCode = this.model.attributes.productCode;
            var pdpAltImageName = HyprLiveContext.locals.themeSettings.pdpAltImageName;
            for (var i = 1; i <= slideCount; i++) {
                if(pdpAltImageName){
                    if(pdpAltImageName.indexOf("{0}") != -1){
                        pdpAltImageName = pdpAltImageName.replace("{0}", this.model.attributes.productCode);
                    }
                    if(pdpAltImageName.indexOf("{1}") != -1){
                        pdpAltImageName = pdpAltImageName.replace("{1}", colorCode);
                    }
                    if(pdpAltImageName.indexOf("{2}") != -1){
                        pdpAltImageName = pdpAltImageName.replace("{2}", i);
                    }
                }
                $(".mz-productimages-thumbs .products_list li:eq(" + (i - 1) + ") .mz-productimages-thumb img")
                    .attr({
                        "src": imagefilepath + '/' + pdpAltImageName +'?maxWidth=' + width_thumb,
                        "data-orig-src": imagefilepath + '/' + pdpAltImageName +'?maxWidth=' + width_pdp,
                        "data-orig-zoom": imagefilepath + '/' + pdpAltImageName +'?maxWidth=' + width_zoom
                    });
                $(".mz-productimages-thumbs .products_list_mobile li:eq(" + (i - 1) + ") img")
                    .attr({
                        "src": imagefilepath + '/' + pdpAltImageName +'?maxWidth=' + width_pdp,
                        "data-orig-src": imagefilepath + '/' + pdpAltImageName +'?maxWidth=' + width_pdp,
                        "data-orig-zoom": imagefilepath + '/' + pdpAltImageName +'?maxWidth=' + width_zoom,
                        "data-zoom-image": imagefilepath + '/' + pdpAltImageName +'?maxWidth=' + width_zoom
                    });
            }
            if (slideCount > 4) {
                initSlider();
            }
            initslider_mobile();
        },
        initialize: function() {
            // handle preset selects, etc
            var me = this;
            //create div for family members
            if(this.model.get('family').models.length){
                for(var i=0; i < this.model.get('family').models.length; i++){
                    var html="";
                    html+='<div id="'+this.model.get('family').models[i].get('productCode')+'" class="family-members"></div>';
                    $("#mz-family-container").append(html);
                }
            }
            me.isColorClicked = false;
            me.mainImage = '';
            if (deviceType && me.model.get('content').get('productImages').length > 1)
                $('#zoom_1').elevateZoom({ zoomType: "inner", cursor: "crosshair", responsive: true });
            else
                $('#zoom').elevateZoom({ zoomType: "inner", cursor: "crosshair", responsive: true });
            this.$('[data-mz-product-option]').each(function() {
                var $this = $(this),
                    isChecked, wasChecked;
                if ($this.val()) {
                    switch ($this.attr('type')) {
                        case "checkbox":
                        case "radio":
                            isChecked = $this.prop('checked');
                            wasChecked = !!$this.attr('checked');
                            if ((isChecked && !wasChecked) || (wasChecked && !isChecked)) {
                                me.configure($this);
                            }
                            break;
                        default:
                            me.configure($this);
                    }
                }
            });
        }
    });

    $(document).ready(function() {
        if ($('.mz-product-detail-tabs ul.tabs li').length === 0)
            $('.mz-product-detail-tabs').remove();

        var product = ProductModels.Product.fromCurrent();

        product.on('addedtocart', function (cartitem, stopRedirect) {
            if (cartitem && cartitem.prop('id')) {
                //product.isLoading(true);
                CartMonitor.addToCount(product.get('quantity'));
                $('html,body').animate({
                    scrollTop: $('header').offset().top
                }, 1000);
                product.set('quantity', 1);
                if(product.get('options')){
                    var optionModels = product.get('options').models;
                    for(var k = 0; k< product.get('options').models.length; k++){
                        optionModels[k].set('value', null);
                    }
                }
                product.unset('stockInfo');
                var priceDiscountTemplate = Hypr.getTemplate("modules/product/price-stack");
                $('.mz-productdetail-price').html(priceDiscountTemplate.render({
                    model: priceModel
                }));
                if (product.get('options').length)
                    $("[data-mz-action='addToCart']").addClass('button_disabled');
                $(".mz-productcodes-productcode").text(Hypr.getLabel('item')+" # " + product.get('productCode'));
                if(!stopRedirect) {
                    window.location.href = (HyprLiveContext.locals.pageContext.secureHost || HyprLiveContext.locals.siteContext.siteSubdirectory) + "/cart";
                }
            } else {
                product.trigger("error", { message: Hypr.getLabel('unexpectedError') });
            }
        });

        product.on('addedtowishlist', function(cartitem) {
            $('#add-to-wishlist').prop('disabled', 'disabled').text(Hypr.getLabel('addedToWishlist'));
        });

        initSlider();
        initslider_mobile();
        //Custom Functions related to slider
        function createPager(carousal) {
            var totalSlides = carousal.getSlideCount();
            var newPager = $(".mz-productimages-pager");
            for (var i = 0; i < totalSlides; i++) {
                if (i === 0) {
                    newPager.append("<div data-mz-productimage-thumb=" + (i + 1) + " class=\"activepager\"></div>");
                } else {
                    newPager.append("<div data-mz-productimage-thumb=" + (i + 1) + " class=\"\"></div>");
                }
            }
            newPager.find('div').click(function() {
                var indx = $(".mz-productimages-pager div").index($(this));
                slider_mobile.goToSlide(indx);
                $(".mz-productimages-pager div").removeClass("activepager").eq(indx).addClass("activepager");
            });
        }
        if ($('#productmobile-Carousel').length) {
            createPager(slider_mobile);
        }

        var productImagesView = new ProductImageViews.ProductPageImagesView({
            el: $('[data-mz-productimages]'),
            model: product
        });

        var productView = new ProductView({
            el: $('.product-detail'),
            model: product,
            messagesEl: $('[data-mz-message-bar]')
        });

        window.productView = productView;
        window.familyLength = window.productView.model.attributes.family.models.length;

        productView.render();

        //IF on page laod Variation code is available then Displays UPC messages
        if (window.productView.model.get('variationProductCode')) {
            var sp_price = "";
            if (window.productView.model.get('inventoryInfo').onlineStockAvailable && typeof window.productView.model.get('inventoryInfo').onlineStockAvailable !== "undefined") {
                if (typeof window.productView.model.get('price').get('salePrice') != 'undefined')
                    sp_price = window.productView.model.get('price').get('salePrice');
                else
                    sp_price = window.productView.model.get('price').get('price');
                var price = Hypr.engine.render("{{price|currency}}", { locals: { price: sp_price } });
                $('.stock-info').show().html("In Stock <span class='stock-price'>" + price + "</span>");
            }
        }
        productInitialImages = {
            mainImage: product.attributes.mainImage,
            thumbImages: product.attributes.content.attributes.productImages
        };
        if (product.attributes.hasPriceRange) {
            priceModel = {
                hasPriceRange: product.attributes.hasPriceRange,
                priceRange: {
                    lower: product.attributes.priceRange.attributes.lower.attributes,
                    upper: product.attributes.priceRange.attributes.upper.attributes
                },
                price: product.attributes.price.attributes
            };
        } else {
            priceModel = {
                hasPriceRange: product.attributes.hasPriceRange,
                price: product.attributes.price.attributes
            };
        }

        var productData = product.apiModel.data;
        var recentProduct = {
            code:productData.productCode
        };
        var existingProducts = $.cookie("recentProducts");
        var recentProducts = existingProducts ? $.parseJSON(existingProducts) : [];
        recentProducts = recentProd(recentProducts, recentProduct);
        $.cookie("recentProducts", JSON.stringify(recentProducts), {path: '/', expires: 21 });
    });

    function recentProd(json, product) {
        var found = false;
        var maxItems = HyprLiveContext.locals.themeSettings.maxRecentlyViewedItems;

        for (var i = 0 ; i < json.length; i++) {
            if (json[i].code == product.code){
                found = true;
                json.splice(i, 1);
                break;
            }
        }
        json.unshift(product);

        if(json.length == maxItems+2){
            json.splice(maxItems+1, 1);
        }
        return json;
    }
    $('body').on('click', '#mz-close-button', function(e) {
        e.preventDefault();
        blockUiLoader.unblockUi();
    });
});

define("pages/product", function(){});
