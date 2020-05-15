
/**
 * Simple extension to Backbone.MozuView that adds an `editing` object in the
 * template evaluation context. Update this `editing` object to indicate which
 * model is in mid-edit.
 */

define('modules/editable-view',['modules/backbone-mozu'], function(Backbone) {

  var EditableView = Backbone.MozuView.extend({
    constructor: function EditableMozuView() {
        Backbone.MozuView.apply(this, arguments);
        this.editing = {};
    },
    getRenderContext: function () {
        var c = Backbone.MozuView.prototype.getRenderContext.apply(this, arguments);
        c.editing = this.editing;
        return c;
    },
    doModelAction: function (action, payload) {
        var self = this,
            renderAlways = function () {
                self.render();
            };
        var operation = this.model[action](payload);
        if (operation && operation.then) {
            operation.then(renderAlways, renderAlways);
            return operation;
        }
    },
    handleLoadingChange: function(isLoading) {
        Backbone.MozuView.prototype.handleLoadingChange.apply(this, arguments);
        var allInputElements = this.$('input,select,button,textarea');
        if (!this.alreadyDisabled && isLoading) {
            this.alreadyDisabled = allInputElements.filter(':disabled');
            allInputElements.prop('disabled',true);
        } else {
            if (this.alreadyDisabled) {
                allInputElements.not(this.alreadyDisabled).removeProp('disabled');
                this.alreadyDisabled = false;
            } else {
                allInputElements.removeProp('disabled');
            }
        }
    }
  });

  return EditableView;

});

/**
 * Quick utility to use on Backbone MozuViews. In case some third party
 * absolutely has to bind an event to an individual DOM element, the view will 
 * need to preserve that actual element between renders. Normally, .render()
 * with HyprLive will destroy and recreate the view's entire innerHTML. This
 * function will take a set of CSS selectors and a callback, and will preserve
 * matching elements through multiple renders, by storing a reference to them
 * and then putting them back where they were. Call this function in your
 * .render() method and send the view-destroying function as its
 * `renderCallback`. You'll be glad you did.
 *
 * Example:
 *
 *     define(['preserve-element-through-render', 'backbone'], 
 *       function(preserveElements, Backbone) {
 *         return Backbone.MozuView.extend({
 *           render: function() {
 *             preserveElements(this, ['.v-button'], function() {
 *               Backbone.MozuView.prototype.render.call(this);
 *             });
 *           }    
 *         });
 *     });
 * 
 * 
 * @param {object} view The Backbone.MozuView we're working with.
 * @param {string[]} selectors An array of selectors for elements to preserve.
 * @param {function} renderCallback A callback representing the render action.
 */

define('modules/preserve-element-through-render',['underscore'], function(_) {
  return function(view, selectors, renderCallback) {
    var thisRound = {};
    view._preserved = view._preserved || {};
    _.each(selectors, function(selector) {
      thisRound[selector] = view.$(selector);
    });
    renderCallback.call(view);
    _.each(thisRound, function($element, selector) {
      var $preserved = view._preserved[selector];
      if ($element.length > 0 && (!$preserved || $preserved.length === 0)) {
        $preserved = view._preserved[selector] = $element;
      }
      if ($preserved && $preserved.length > 0) {
        view.$(selector).replaceWith($preserved);
      }
    });

  };
});
define('modules/checkout/steps/models-base-checkout-step',[
    'modules/jquery-mozu',
    'underscore',
    'hyprlive',
    'modules/backbone-mozu',
    'modules/api',
    'hyprlivecontext'
],
function ($, _, Hypr, Backbone, api, HyprLiveContext) {

    var CheckoutStep = Backbone.MozuModel.extend({
        helpers: ['stepStatus', 'requiresFulfillmentInfo', 'requiresDigitalFulfillmentContact', 'isMultiShipMode'],  //
        // instead of overriding constructor, we are creating
        // a method that only the CheckoutStepView knows to
        // run, so it can run late enough for the parent
        // reference in .getOrder to exist;

        initStep: function () {
            var me = this;
            this.next = (function(next) {
                return _.debounce(function() {
                    if (!me.isLoading()) next.call(me);
                }, 750, true);
            })(this.next);
            var order = me.getOrder();
            me.calculateStepStatus();
            me.listenTo(order, 'error', function () {
                if (me.isLoading()) {
                    me.isLoading(false);
                }
            });
            me.set('orderId', order.id);
            if (me.apiModel) me.apiModel.on('action', function (name, data) {
                if (data) {
                    data.orderId = order.id;
                } else {
                    me.apiModel.prop('orderId', order.id);
                }
            });
        },
        isAwsCheckout: function() {
            var activePayments = this.getCheckout().apiModel.getActivePayments();
            if (activePayments) {
                var tokenPayment = _.findWhere(activePayments, { paymentType: 'token' });
                if (tokenPayment && tokenPayment.billingInfo.token && tokenPayment.billingInfo.token.type.toLowerCase() == "paywithamazon")
                    return true;

                var legacyPWA = _.findWhere(activePayments, { paymentType: 'PayWithAmazon' });
                if (legacyPWA) return true;
                
                return false;
            } else
               return false;
        },
        isNonMozuCheckout: function() {
            var activePayments = this.getCheckout().apiModel.getActivePayments();
            if (activePayments && activePayments.length === 0) return false;
            return (activePayments && (_.findWhere(activePayments, { paymentType: 'PayPalExpress2' }) || this.isAwsCheckout() ));
        },
        calculateStepStatus: function () {
            // override this!
            var newStepStatus = this.isValid(!this.stepStatus()) ? 'complete' : 'invalid';
            return this.stepStatus(newStepStatus);
        },
        getOrder: function () {
            return this.parent;
        },
        getCheckout: function () {
            return this.parent;
        },
        stepStatus: function (newStatus) {
            if (arguments.length > 0) {
                this._stepStatus = newStatus;
                this.trigger('stepstatuschange', newStatus);
            }
            return this._stepStatus;
        },
        requiresFulfillmentInfo: function () {
            return this.getOrder().get('requiresFulfillmentInfo');
        },
        requiresDigitalFulfillmentContact: function () {
            return this.getOrder().get('requiresDigitalFulfillmentContact');
        },
        edit: function () {
            this.stepStatus('incomplete');
        },
        next: function () {
            if (this.submit()) this.isLoading(true);
        },
        isMultiShipMode: function(){
            return this.parent.get('isMultiShipMode');
        },
        cancelStep: function() {
            var me = this,
            order = me.getOrder();
                me.isLoading(true);
                order.apiModel.get().ensure(function(){
                    me.isLoading(false);
                    return me.stepStatus("complete");
            });
        },
        toggleMultiShipMode : function() {
            var self = this;
            self.parent.syncApiModel();
            if(this.parent.get('isMultiShipMode')){
                this.parent.apiModel.unsetAllShippingDestinations().then(function(){
                    self.parent.set('isMultiShipMode', false);
                    self.trigger('sync');
                });

                return;
            }
            this.parent.set('isMultiShipMode', true);
        }
    });
    return CheckoutStep;
});
define('shim!vendor/bootstrap/js/modal[jquery=jQuery]',['jquery'], function(jQuery) { 

/* ========================================================================
 * Bootstrap: modal.js v3.3.7
 * http://getbootstrap.com/javascript/#modals
 * ========================================================================
 * Copyright 2011-2016 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  

  // MODAL CLASS DEFINITION
  // ======================

  var Modal = function (element, options) {
    this.options             = options
    this.$body               = $(document.body)
    this.$element            = $(element)
    this.$dialog             = this.$element.find('.modal-dialog')
    this.$backdrop           = null
    this.isShown             = null
    this.originalBodyPad     = null
    this.scrollbarWidth      = 0
    this.ignoreBackdropClick = false

    if (this.options.remote) {
      this.$element
        .find('.modal-content')
        .load(this.options.remote, $.proxy(function () {
          this.$element.trigger('loaded.bs.modal')
        }, this))
    }
  }

  Modal.VERSION  = '3.3.7'

  Modal.TRANSITION_DURATION = 300
  Modal.BACKDROP_TRANSITION_DURATION = 150

  Modal.DEFAULTS = {
    backdrop: true,
    keyboard: true,
    show: true
  }

  Modal.prototype.toggle = function (_relatedTarget) {
    return this.isShown ? this.hide() : this.show(_relatedTarget)
  }

  Modal.prototype.show = function (_relatedTarget) {
    var that = this
    var e    = $.Event('show.bs.modal', { relatedTarget: _relatedTarget })

    this.$element.trigger(e)

    if (this.isShown || e.isDefaultPrevented()) return

    this.isShown = true

    this.checkScrollbar()
    this.setScrollbar()
    this.$body.addClass('modal-open')

    this.escape()
    this.resize()

    this.$element.on('click.dismiss.bs.modal', '[data-dismiss="modal"]', $.proxy(this.hide, this))

    this.$dialog.on('mousedown.dismiss.bs.modal', function () {
      that.$element.one('mouseup.dismiss.bs.modal', function (e) {
        if ($(e.target).is(that.$element)) that.ignoreBackdropClick = true
      })
    })

    this.backdrop(function () {
      var transition = $.support.transition && that.$element.hasClass('fade')

      if (!that.$element.parent().length) {
        that.$element.appendTo(that.$body) // don't move modals dom position
      }

      that.$element
        .show()
        .scrollTop(0)

      that.adjustDialog()

      if (transition) {
        that.$element[0].offsetWidth // force reflow
      }

      that.$element.addClass('in')

      that.enforceFocus()

      var e = $.Event('shown.bs.modal', { relatedTarget: _relatedTarget })

      transition ?
        that.$dialog // wait for modal to slide in
          .one('bsTransitionEnd', function () {
            that.$element.trigger('focus').trigger(e)
          })
          .emulateTransitionEnd(Modal.TRANSITION_DURATION) :
        that.$element.trigger('focus').trigger(e)
    })
  }

  Modal.prototype.hide = function (e) {
    if (e) e.preventDefault()

    e = $.Event('hide.bs.modal')

    this.$element.trigger(e)

    if (!this.isShown || e.isDefaultPrevented()) return

    this.isShown = false

    this.escape()
    this.resize()

    $(document).off('focusin.bs.modal')

    this.$element
      .removeClass('in')
      .off('click.dismiss.bs.modal')
      .off('mouseup.dismiss.bs.modal')

    this.$dialog.off('mousedown.dismiss.bs.modal')

    $.support.transition && this.$element.hasClass('fade') ?
      this.$element
        .one('bsTransitionEnd', $.proxy(this.hideModal, this))
        .emulateTransitionEnd(Modal.TRANSITION_DURATION) :
      this.hideModal()
  }

  Modal.prototype.enforceFocus = function () {
    $(document)
      .off('focusin.bs.modal') // guard against infinite focus loop
      .on('focusin.bs.modal', $.proxy(function (e) {
        if (document !== e.target &&
            this.$element[0] !== e.target &&
            !this.$element.has(e.target).length) {
          this.$element.trigger('focus')
        }
      }, this))
  }

  Modal.prototype.escape = function () {
    if (this.isShown && this.options.keyboard) {
      this.$element.on('keydown.dismiss.bs.modal', $.proxy(function (e) {
        e.which == 27 && this.hide()
      }, this))
    } else if (!this.isShown) {
      this.$element.off('keydown.dismiss.bs.modal')
    }
  }

  Modal.prototype.resize = function () {
    if (this.isShown) {
      $(window).on('resize.bs.modal', $.proxy(this.handleUpdate, this))
    } else {
      $(window).off('resize.bs.modal')
    }
  }

  Modal.prototype.hideModal = function () {
    var that = this
    this.$element.hide()
    this.backdrop(function () {
      that.$body.removeClass('modal-open')
      that.resetAdjustments()
      that.resetScrollbar()
      that.$element.trigger('hidden.bs.modal')
    })
  }

  Modal.prototype.removeBackdrop = function () {
    this.$backdrop && this.$backdrop.remove()
    this.$backdrop = null
  }

  Modal.prototype.backdrop = function (callback) {
    var that = this
    var animate = this.$element.hasClass('fade') ? 'fade' : ''

    if (this.isShown && this.options.backdrop) {
      var doAnimate = $.support.transition && animate

      this.$backdrop = $(document.createElement('div'))
        .addClass('modal-backdrop ' + animate)
        .appendTo(this.$body)

      this.$element.on('click.dismiss.bs.modal', $.proxy(function (e) {
        if (this.ignoreBackdropClick) {
          this.ignoreBackdropClick = false
          return
        }
        if (e.target !== e.currentTarget) return
        this.options.backdrop == 'static'
          ? this.$element[0].focus()
          : this.hide()
      }, this))

      if (doAnimate) this.$backdrop[0].offsetWidth // force reflow

      this.$backdrop.addClass('in')

      if (!callback) return

      doAnimate ?
        this.$backdrop
          .one('bsTransitionEnd', callback)
          .emulateTransitionEnd(Modal.BACKDROP_TRANSITION_DURATION) :
        callback()

    } else if (!this.isShown && this.$backdrop) {
      this.$backdrop.removeClass('in')

      var callbackRemove = function () {
        that.removeBackdrop()
        callback && callback()
      }
      $.support.transition && this.$element.hasClass('fade') ?
        this.$backdrop
          .one('bsTransitionEnd', callbackRemove)
          .emulateTransitionEnd(Modal.BACKDROP_TRANSITION_DURATION) :
        callbackRemove()

    } else if (callback) {
      callback()
    }
  }

  // these following methods are used to handle overflowing modals

  Modal.prototype.handleUpdate = function () {
    this.adjustDialog()
  }

  Modal.prototype.adjustDialog = function () {
    var modalIsOverflowing = this.$element[0].scrollHeight > document.documentElement.clientHeight

    this.$element.css({
      paddingLeft:  !this.bodyIsOverflowing && modalIsOverflowing ? this.scrollbarWidth : '',
      paddingRight: this.bodyIsOverflowing && !modalIsOverflowing ? this.scrollbarWidth : ''
    })
  }

  Modal.prototype.resetAdjustments = function () {
    this.$element.css({
      paddingLeft: '',
      paddingRight: ''
    })
  }

  Modal.prototype.checkScrollbar = function () {
    var fullWindowWidth = window.innerWidth
    if (!fullWindowWidth) { // workaround for missing window.innerWidth in IE8
      var documentElementRect = document.documentElement.getBoundingClientRect()
      fullWindowWidth = documentElementRect.right - Math.abs(documentElementRect.left)
    }
    this.bodyIsOverflowing = document.body.clientWidth < fullWindowWidth
    this.scrollbarWidth = this.measureScrollbar()
  }

  Modal.prototype.setScrollbar = function () {
    var bodyPad = parseInt((this.$body.css('padding-right') || 0), 10)
    this.originalBodyPad = document.body.style.paddingRight || ''
    if (this.bodyIsOverflowing) this.$body.css('padding-right', bodyPad + this.scrollbarWidth)
  }

  Modal.prototype.resetScrollbar = function () {
    this.$body.css('padding-right', this.originalBodyPad)
  }

  Modal.prototype.measureScrollbar = function () { // thx walsh
    var scrollDiv = document.createElement('div')
    scrollDiv.className = 'modal-scrollbar-measure'
    this.$body.append(scrollDiv)
    var scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth
    this.$body[0].removeChild(scrollDiv)
    return scrollbarWidth
  }


  // MODAL PLUGIN DEFINITION
  // =======================

  function Plugin(option, _relatedTarget) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.modal')
      var options = $.extend({}, Modal.DEFAULTS, $this.data(), typeof option == 'object' && option)

      if (!data) $this.data('bs.modal', (data = new Modal(this, options)))
      if (typeof option == 'string') data[option](_relatedTarget)
      else if (options.show) data.show(_relatedTarget)
    })
  }

  var old = $.fn.modal

  $.fn.modal             = Plugin
  $.fn.modal.Constructor = Modal


  // MODAL NO CONFLICT
  // =================

  $.fn.modal.noConflict = function () {
    $.fn.modal = old
    return this
  }


  // MODAL DATA-API
  // ==============

  $(document).on('click.bs.modal.data-api', '[data-toggle="modal"]', function (e) {
    var $this   = $(this)
    var href    = $this.attr('href')
    var $target = $($this.attr('data-target') || (href && href.replace(/.*(?=#[^\s]+$)/, ''))) // strip for ie7
    var option  = $target.data('bs.modal') ? 'toggle' : $.extend({ remote: !/#/.test(href) && href }, $target.data(), $this.data())

    if ($this.is('a')) e.preventDefault()

    $target.one('show.bs.modal', function (showEvent) {
      if (showEvent.isDefaultPrevented()) return // only register focus restorer if modal will actually get shown
      $target.one('hidden.bs.modal', function () {
        $this.is(':visible') && $this.trigger('focus')
      })
    })
    Plugin.call($target, option, this)
  })

}(jQuery);
 ; 

return null; 

});


//@ sourceURL=/vendor/bootstrap/js/modal.js

;
//A quick modular way to make a Bootstrap modal.
//Documentation from Bootstrap here:
// https://v4-alpha.getbootstrap.com/components/modal/

define('modules/modal-dialog',['modules/jquery-mozu', 'shim!vendor/bootstrap/js/modal[jquery=jQuery]'],
 function ($) {

   var instance;

   /*For this modal to function, you must pass it  an options object that has
   AT LEAST:
   -elementId: id of element to turn into a modal
   */

   function Modal(opts){
     var me = this;
     this.options = opts;
     var elementId = this.options.elementId || null;
     //**Necessary: id of element to turn into a modal.
     //This element should {% include 'modules/common/modal-dialog' %},
     //or an element that extends the above template,
     //or the creator should be familiar with the components of a bootstrap modal.
     //It should also have the class "modal" for css purposes
     var theElement;
     if(!elementId) {
       //return an error
     } else {
       theElement = $('#'+elementId);
     }

     var buildModal = function(){
       //This function creates the dialog based on the options variable.
       //If the dialog has already been made once (perhaps with different options),
       //We want to clear it out. Some of the building involves appending,
       //so if we don't clear it first, we'll get double buttons
       var header = me.options.header || null;
       //Appends to the end of the .modal-header div.
       var title = me.options.title || null;
       //Prepends a <h4> element in the .modal-header div.
       var body = me.options.body || "";
       //Fills the .modal-body div.
       var footer = me.options.footer || false;
       //If true, Prepends content in the .modal-footer div.

       var hasXButton = (typeof me.options.hasXButton !== 'undefined') ? me.options.hasXButton : true;
       //Puts an x button in the top right corner that will close the dialog.
       var hasCloseButton = me.options.hasCloseButton || false;
       //Puts a 'Close' butotn in the bottom right corner that will close the dialog.
       var scroll = me.options.scroll || 'default';
       /*
       Bootstrap modals, by default, steal control of the page's scroll bar. This means that if your content
       goes past the height of the page, it'll be scrollable and it'll probably be fine.
       If you want to limit the height of your modal and have a scroll bar on the dialog itself,
       your best bet is probably just to include it manually in the body. If you'd prefer,
       you can use this scroll option - set it to true to use it, but know that for it to
       work you also need to set the bodyHeight option.
       */
       var width = me.options.width || 'default';
       //pretty straightforward - limits the width of the element.
       //if default, the width will be 598px.
       //Regardless, the width will extend to 100% if the viewport is more narrow
       //than 768px.
       var bodyHeight = me.options.bodyHeight || 'default';
       //We don't have a way to set the height of the entire modal element, but you can
       //define the height of the body for scroll purposes here.
       //By default, the body will match to fit the contents.


       var backdrop = me.options.backdrop || 'true';




         ////////////////
         //***HEADER***//
         ////////////////


         if (title){
           //put title in modal-title h4
           theElement.find('.modal-header').html("<h3 class='modal-title'>"+title+"</h3>");
         }

         if (header){
           theElement.find('.modal-header').append("</br>"+header);
           //if header option has been set, append after title
         }

         if (hasXButton){
           //prepend xButton to header
           var $xButton = $("<button>", {"type": "button", "class": "close", "aria-hidden": "true" });
           $xButton.html('&times;');

           $xButton.on('click', function(){
             theElement.modal('hide');
           });

           theElement.find('.modal-header').prepend($xButton);
         }

        //  if (!title && !header && !hasXButton){
        //    //if title, header, and hasXButton are all unset, we don't want a header at all.
        //    theElement.find('.modal-header').hide();
        //  }

         //////////////
         //***BODY***//
         //////////////

         if (body){
           theElement.find('.modal-body').html(body);
         }


         if (scroll === 'auto') {
          theElement.find('.modal-body').css('overflow', 'auto');
         } else if (scroll != 'default'){
           theElement.find('.modal-body').css('overflow', 'scroll');
         }
         ////////////////
         //***FOOTER***//
         ////////////////

         if (footer){
           theElement.find('.modal-footer').html(footer);
         } 

         if (hasCloseButton){
           var $closeButton = $("<button>", {"type": "button", "class": "mz-button", "aria-hidden": "true" });
           $closeButton.text("Close");
           $closeButton.on('click', function(){
             theElement.modal('hide');
           });

           theElement.find('.modal-footer').append($closeButton);
         }

         ////////////////
         //***GENERAL***//
         ////////////////

         if (width!=="default"){
           theElement.find('.modal-dialog').width(width);
         }

         if (bodyHeight!=="default"){
           theElement.find('.modal-body').height(bodyHeight);
         }

     };


       //RETURN:

       return {

         show: function(){
           if (me.options.backdrop===null || me.options.backdrop===undefined){
             theElement.modal();
           } else {
             theElement.modal({backdrop: me.options.backdrop});
           }
         },

         hide: function(){
           theElement.modal('hide');
         },

         setBody: function(body) {
           me.options.body = body;
           theElement.find('.modal-body').html(body);

         },

         setOptions: function(opts) {
           me.options = opts;
           buildModal();
         },

         build: function(){
           buildModal();
         }

       };

   }

   return {
		init: function(options) {

			var modal = new Modal(options);
      modal.build();
      return modal;
		}
	};
 });

define('modules/checkout/models-shipping-destinations',[
    'modules/jquery-mozu',
    'underscore',
    'hyprlive',
    'modules/backbone-mozu',
    'modules/api',
    'hyprlivecontext',
    'modules/models-customer',
    'modules/checkout/steps/models-base-checkout-step',
    'modules/modal-dialog'
],
function ($, _, Hypr, Backbone, api, HyprLiveContext, CustomerModels, CheckoutStep, ModalDialog) {

    var ShippingDestination = Backbone.MozuModel.extend({
        relations: {
            destinationContact: CustomerModels.Contact
        },
        dataTypes: {
            destinationId: function(val) {
                return (val === 'new') ? val : Backbone.MozuModel.DataTypes.Int(val);
            }
        },
        validation: this.validationDefault,
        validationDefault : {
            'destinationId': function (value) {
                if (!value || typeof value !== "number") return Hypr.getLabel('passwordMissing');
            }
        },
        validationDigitalDestination : {
            "destinationContact.email" : {
                fn: function (value) {
                    if (!value || !value.match(Backbone.Validation.patterns.email)) return Hypr.getLabel('emailMissing');
                }
            }
        },
        requiredBehaviors: [1002],
        initialize : function(){
            var self = this;
            //We do not persit a Gift Card Destination Flag
            //Instead we determine from the bloew checks and set Validation and Flag for a Gift Card Destination here
            if(self.get('destinationContact').get('email') && !self.get('destinationContact').get('address').get('address1')){
                self.validation = self.validationDigitalDestination;
                self.set('isGiftCardDestination', true);
            }
        },
        getCheckout : function(){
            return this.collection.parent;
        },
        validateDigitalDestination: function(){
            this.validation = this.validationDigitalDestination();
            var validationErrors =  this.validate();

            this.validation = this.validationDefault;

            return validationErrors;
        },
        selectedFulfillmentAddress : function(){
            var self = this;
            return self.collection.pluck("id");
        },
        removeDestination: function(lineId, id){
            var self = this;
            self.get(lineId).get('items').remove(id);
        },
        isDestinationSaved: function(){
            return (this.get('id')) ? true : false;
        },
        saveDestinationAsync: function(){
            var self = this;
            return self.collection.apiSaveDestinationAsync(self).then(function(data){
                self.trigger('sync');
                return data;
            });
        }
    });

    var ShippingDestinations = Backbone.Collection.extend({
         model : ShippingDestination,
         validation: {
            ShippingDestination : "validateShippingDestination"
        },
        requiredBehaviors: [1002],
        validateShippingDestination : function(value, attr, computedState){
            var itemValidations =[];
            this.collection.each(function(item,idx){
                var validation = item.validate();
                if(validation.ShippingDestinationItem.length) itemValidations = itemValidations.concat(validation.ShippingDestinationItem);
            });
            return (itemValidations.length) ? itemValidations : null; 
        },
        getCheckout : function(){
            return this.parent;
        },
        newDestination : function(contact, isCustomerAddress, customerContactType){
            var destination = {destinationContact : contact || new CustomerModels.Contact()};

            if(isCustomerAddress && contact.get('id')){
               destination.customerContactId = contact.get('id');
            }

            if(customerContactType){
                destination.customerContactType = customerContactType;
                if(customerContactType === "Billing" && !destination.id){
                    destination.id = _.uniqueId("billing_");
                }
            }

            var shippingDestination = new ShippingDestination(destination);
            this.add(shippingDestination);
            return shippingDestination;
        },
        newGiftCardDestination : function(){
            var self = this;
            var user = require.mozuData('user');
            var destination = {destinationContact : new CustomerModels.Contact({})};
            var giftCardDestination = new ShippingDestination(destination);

            giftCardDestination.validation = giftCardDestination.validationDigitalDestination;
            giftCardDestination.set('isGiftCardDestination', true);

            if (user.isAuthenticated) {
                giftCardDestination.get('destinationContact').set('email', user.email);
            }

            self.add(giftCardDestination);
            return giftCardDestination;
        },
        nonGiftCardDestinations : function(){
            var destinations = this.filter(function(destination, idx){
                return !destination.get('isGiftCardDestination');
            });
            return destinations;
        },
        singleShippingDestination : function(){
            var self = this;
            var shippingDestinations = this.nonGiftCardDestinations();
            var destination = "";

            if(!shippingDestinations.length) {
                destination = this.newDestination();
                destination.set('isSingleShipDestination', true);
            }
 
            if(!destination) {
                destination = this.find(function(destination, idx){
                    return (destination.get('isSingleShipDestination'));
                });
            }

            if(!destination) {
                destination = shippingDestinations[0];
            } 

            
            return destination;
        },
        hasDestination: function(destinationContact){
            var self = this;
            var foundDestination = self.find(function(destination){
                return self.compareAddressObjects(destination.get('destinationContact').get('address').toJSON(), destinationContact.get('address').toJSON());
            });
            return (foundDestination) ? foundDestination : false;
        },
        compareAddressObjects: function(obj1, obj2) {
            var areEqual = _.isMatch(obj1, {
                address1 : obj2.address1,
                addressType : obj2.addressType,
                cityOrTown : obj2.cityOrTown,
                countryCode : obj2.countryCode,
                postalOrZipCode : obj2.postalOrZipCode,
                stateOrProvince : obj2.stateOrProvince
            });
            return areEqual;
        },
        apiSaveDestinationAsync : function(destination){
            var self = this;
            return self.getCheckout().apiModel.addShippingDestination({DestinationContact : destination.get('destinationContact').toJSON()});
        },
        saveShippingDestinationAsync: function(destination){
            var self = this;
            return self.apiSaveDestinationAsync(destination).then(function(data){
                self.add(data.data);
                return data;
            });
        },
        updateShippingDestinationAsync : function(destination){
            var self = this;
            return self.apiUpdateShippingDestinationAsync(destination).then(function(data){
                var entry = self.findWhere({id: data.data.id});
                    if(entry) {
                        //var mergedDestinationContact = _.extend(entry.get('destinationContact'),  data.data.destinationContact);
                        entry.set('destinationContact', data.data.destinationContact); 
                        self.trigger('sync');
                        self.trigger('destinationsUpdate');
                    }
                return data;
            });
        },
        apiUpdateShippingDestinationAsync: function(destination){
            var self = this;
            var dest = destination.toJSON();
            dest.destinationId = dest.id;
            dest.checkoutId = this.getCheckout().get('id');
            return self.getCheckout().apiModel.updateShippingDestination(dest).then(function(data){
                return data;
            });
        }        
    });
   
    return {
        ShippingDestinations: ShippingDestinations,
        ShippingDestination : ShippingDestination
    };
});
define('modules/checkout/steps/step1/models-step-shipping-info',[
    'modules/jquery-mozu',
    'underscore',
    'hyprlive',
    'modules/backbone-mozu',
    'modules/api',
    'hyprlivecontext',
    'modules/checkout/steps/models-base-checkout-step',
    'modules/checkout/models-shipping-destinations',
    'modules/models-customer'
],
function ($, _, Hypr, Backbone, api, HyprLiveContext, CheckoutStep, ShippingDestinationModels, CustomerModels) {

    var ShippingStep = CheckoutStep.extend({
        helpers : ['orderItems', 'selectableDestinations', 'selectedDestination', 'selectedDestinationsCount', 'totalQuantity'],
        validation: this.multiShipValidation,
        digitalOnlyValidation: {
            fn: function(value, attr){
                var destinationErrors = [];

                var giftCardDestination = this.parent.get('destinations').find(function(destination, idx){
                    return (destination.get('isGiftCardDestination'));
                });

                destinationErrors = giftCardDestination.validate();

                return (destinationErrors) ? destinationErrors : false;
            }
        },
        singleShippingAddressValidation : {
            singleShippingAddess : {
                fn : function(value, attr){
                    var destination = this.parent.get('destinations').singleShippingDestination();
                    if(destination){
                        var instance = destination.get('destinationContact') instanceof CustomerModels.Contact;
                        if(!instance) {
                            destination.set('destinationContact',  new CustomerModels.Contact(destination.get('destinationContact')));
                        }
                        var destinationErrors = destination.get('destinationContact').validate();
                        return (destinationErrors) ? destinationErrors : false;
                    }
                    return true;
                }
            }
        },
        multiShipValidation : {
            ShippingDestinations :{
              fn: function (value, attr) {
                    var destinationErrors = [],self = this;
                    if (!self.get("isMultiShipMode")) {
                        var isValid = self.selectedDestination();
                        //console.log("asdsa");
                        self.parent.get('items').forEach(function (item, idx) {
                            if (typeof item.attributes.destinationId == "undefined") {
                                return destinationErrors.push({ "destinationId": Hypr.getLabel('genericRequired') });
                            }
                        });
                        return (destinationErrors.length) ? destinationErrors : false;
                    }
                    self.parent.get('items').forEach(function (item, idx) {
                        var itemValid = item.validate();
                        if (itemValid && item.get('fulfillmentMethod') === "Ship") {
                            destinationErrors.push(itemValid);
                        }
                    });
                    return (destinationErrors.length) ? destinationErrors : false;
                }
            }
        },
        getCheckout: function(){
            return this.parent;
        },
        initStep: function () {
            var self = this;
            if (self.requiresDigitalFulfillmentContact()) {
                var giftCardDestination = self.getCheckout().get('destinations').findWhere({'isGiftCardDestination': true});
                if(!giftCardDestination) {
                    giftCardDestination = self.getCheckout().get('destinations').newGiftCardDestination();
                    self.getDestinations().apiSaveDestinationAsync(giftCardDestination).then(function(data){
                        self.updateDigitalItemDestinations(data.data.id);
                    });
                }
                self.getCheckout().get('destinations').reset = function(models, options) {
                    var giftCardDestination = self.getCheckout().get('destinations').findWhere({'isGiftCardDestination': true});
                    if(giftCardDestination && !_.findWhere(models, {'isGiftCardDestination': true})) {
                        models.push(giftCardDestination);
                    }
                    Backbone.Collection.prototype.reset.apply(this, arguments);
                };
            }
            CheckoutStep.prototype.initStep.apply(this, arguments);
        },
        initialize : function() {
            //TO-DO: This is a work around for the api sync rerendering collections.
            // Replace before using in Prod
            var self = this;
        },
        // digitalGiftDestination :function() {
        //     //TO-DO : Primary Addresss select First
        //     var shippingDestinations = this.getCheckout().get('destinations');
        //     var dGDestination = shippingDestinations.findWhere({digitalGiftDestination: true});
        //     if(dGDestination){
        //         return dGDestination.toJSON();
        //     }
        //     return new ShippingDestinationModels.ShippingDestination({});
        // },
        orderItems : function(){
            return this.parent.get("items").sortBy('originalCartItemId');
        },
        splitCheckoutItem: function(itemId, quantity){
            //Move isLoading to SDK
            var self = this;
            self.isLoading(true);
            this.getCheckout().apiSplitCheckoutItem({itemId : itemId, quantity : quantity}).ensure(function(data){
                self.isLoading(false);
            });
        },

        selectableDestinations : function(){
           var selectable = [];
           this.getCheckout().get('destinations').each(function(destination){
                if(!destination.get('isGiftCardDestination')){
                    selectable.push(destination.toJSON());
                }
            });
            return selectable;
        },
        selectedDestinationsCount : function(){
            var shippingItems = this.parent.get("items").filter(function(item){ return item.get('fulfillmentMethod') == "Ship"; });
            var destinationCount = _.countBy(shippingItems, function(item){
                return item.get('destinationId');
            });
            return _.size(destinationCount);
        },
        totalQuantity: function(){
          var totalQty = 0;
          this.parent.get("items").forEach(function(item){
              totalQty+=item.get("quantity");
          });
          return totalQty;
        },
        selectedDestination : function(){
            var directShipItems = this.getCheckout().get('items').findWhere({fulfillmentMethod: "Ship"});
            var selectedId = "";

            if(directShipItems){
                selectedId = directShipItems.get('destinationId');
            }

            if(selectedId){
                return this.getCheckout().get('destinations').get(selectedId).toJSON();
            }
        },
        updateSingleCheckoutDestination: function(destinationId, customerContactId){
            var self = this;
            self.isLoading(true);
            if(destinationId){
                return self.getCheckout().apiSetAllShippingDestinations({
                    destinationId: destinationId
                }).ensure(function(){
                     self.isLoading(false);
                });
            }

            var destination = self.getCheckout().get('destinations').findWhere({customerContactId: customerContactId});
            if(destination){
                return destination.saveDestinationAsync().then(function(data){
                    return self.getCheckout().apiSetAllShippingDestinations({
                        destinationId: data.data.id
                    }).ensure(function(){
                        self.isLoading(false);
                    });
                });
            }
        },
        addNewContact: function(){
            this.getCheckout().get('dialogContact').resetDestinationContact();
            this.getCheckout().get('dialogContact').unset('id');

            this.getCheckout().get('dialogContact').trigger('openDialog');
        },
        editContact: function(destinationId){
            var destination = this.getDestinations().findWhere({'id': destinationId});

            if(destination){
                var destCopy = destination.toJSON();
                destCopy = new ShippingDestinationModels.ShippingDestination(destCopy);
                //destCopy.set('destinationContact', new CustomerModels.Contact(destCopy.get('destinationContact')));
                //this.getCheckout().get('dialogContact').get("destinationContact").clear();
                this.getCheckout().set('dialogContact', destCopy);
                this.getCheckout().get('dialogContact').set("destinationContact", new CustomerModels.Contact(destCopy.get('destinationContact').toJSON()));
                this.getCheckout().get('dialogContact').trigger('openDialog');
            }
        },
        getDestinations : function() {
            return this.parent.get("destinations");
        },
        updateDigitalItemDestinations: function(destinationId){
            var self = this;
            var payload = [{
                destinationId: destinationId,
                itemIds: []
            }];
            var digitalItemIds = self.getCheckout().get('items').each(function(item){
                if(item.get('fulfillmentMethod') === "Digital") {
                    payload[0].itemIds.push(item.get('id'));
                }
            });
            if(digitalItemIds.length) {
                this.getCheckout().apiModel.updateCheckoutItemDestinationBulk({id: self.getCheckout().get('id'), postdata: payload});
            }
        },
        toJSON: function() {
                if (this.requiresFulfillmentInfo() || this.requiresDigitalFulfillmentContact()) {
                    return CheckoutStep.prototype.toJSON.apply(this, arguments);
                }
            },
            //Rename for clear
        //Rename for clear
        isDigitalValid: function() {
            var email = this.get('email');
            return (!email) ? false : true;
        },
        //Rename for clear
        // Breakup into seperate api update for fulfillment

        digitalGiftCardValid :function(){
            var self = this;
            self.validation = self.digitalOnlyValidation;

           var validationObj = self.validate();

            if (validationObj) {
                if (validationObj) {
                    Object.keys(validationObj.fn).forEach(function(key) {
                        this.trigger('error', {
                            message: validationObj.fn[key]
                        });
                    }, this);
                }
                return false;
            }
            return true;
        },
        saveDigitalGiftCard: function() {
            var self = this,
            checkout = self.getCheckout();

            if(self.digitalGiftCardValid()){
                var giftCardDestination = this.parent.get('destinations').find(function(destination, idx){
                    return (destination.get('isGiftCardDestination'));
                });

                if(giftCardDestination) {
                    if(!giftCardDestination.get('id')) {
                        self.getDestinations().apiSaveDestinationAsync(giftCardDestination).then(function(data){
                            self.updateDigitalItemDestinations(data.data.id);
                            //self.getCheckout.updateCheckoutItemDestinationBulk
                        });
                    } else {
                        self.getDestinations().apiUpdateShippingDestinationAsync(giftCardDestination).then(function(data){
                            self.updateDigitalItemDestinations(data.data.id);
                        });
                    }
                }
                return true;
            } else {
                return false;
            }
        },
        singleShippingAddressValid : function(){
            this.validation = this.singleShippingAddressValidation;
            var validationObj = this.validate();

            if (validationObj) {
               /* if (validationObj) {
                    Object.keys(validationObj.singleShippingAddess).forEach(function(key) {
                        this.trigger('error', {
                            message: validationObj.singleShippingAddess[key]
                        });
                    }, this);
                }*/
                return false;
            }
            return true;
        },
        nextSingleShippingAddress: function() {
            var self = this,
            checkout = this.getCheckout();

            if(this.singleShippingAddressValid()){
                if(this.selectableDestinations().length < 2) {
                    self.validateAddresses();
                } else {
                    self.completeStep();
                }
            }
        },
        validateAddresses : function(){

            var self = this;
            var checkout = this.parent;

            var isAddressValidationEnabled = HyprLiveContext.locals.siteContext.generalSettings.isAddressValidationEnabled,
                    allowInvalidAddresses = HyprLiveContext.locals.siteContext.generalSettings.allowInvalidAddresses;

            var shippingDestination = self.getDestinations().singleShippingDestination();
            var addr = shippingDestination.get('destinationContact').get('address');

            var scrubBillingContactId = function(){
                if(shippingDestination.get('id')) {
                    var isBilling = shippingDestination.get('id').toString().startsWith("billing_");
                    if(isBilling) {
                        shippingDestination.set('id', "");
                    }
                }
                return shippingDestination;
            };

            var saveAddress = function(){
                self.isLoading('true');
                scrubBillingContactId();

                if(!shippingDestination.get('id')) {
                    self.getDestinations().apiSaveDestinationAsync(shippingDestination).then(function(data){
                        self.getCheckout().apiSetAllShippingDestinations({destinationId: data.data.id}).then(function(){
                            self.completeStep();
                        });
                    });
                } else {
                    self.getDestinations().updateShippingDestinationAsync(shippingDestination).then(function(data){
                        self.getCheckout().apiSetAllShippingDestinations({destinationId: data.data.id}).then(function(){
                            self.completeStep();
                        });
                    });
                }
            };

            if (!isAddressValidationEnabled) {
                saveAddress();
            } else {
                if (!addr.get('candidateValidatedAddresses')) {
                    var methodToUse = allowInvalidAddresses ? 'validateAddressLenient' : 'validateAddress';
                    addr.syncApiModel();
                    checkout.messages.reset();
                    addr.apiModel[methodToUse]().then(function (resp) {
                        if (resp.data && resp.data.addressCandidates && resp.data.addressCandidates.length) {
                            if (_.find(resp.data.addressCandidates, addr.is, addr)) {
                                addr.set('isValidated', true);
                                    saveAddress();
                                    return;
                                }
                            addr.set('candidateValidatedAddresses', resp.data.addressCandidates);
                            self.trigger('render');
                        } else {
                            saveAddress();
                        }
                    }, function (e) {
                        if (allowInvalidAddresses) {
                            // TODO: sink the exception.in a better way.
                            checkout.messages.reset();
                            saveAddress();
                        } else {
                            checkout.messages.reset({ message: Hypr.getLabel('addressValidationError') });
                        }
                    });
                } else {
                    saveAddress();
                }
            }
        },
        calculateStepStatus: function() {

            if (!this.requiresFulfillmentInfo() && !this.requiresDigitalFulfillmentContact()) return this.stepStatus('complete');

            if (this.requiresDigitalFulfillmentContact()) {
                this.validation = this.digitalOnlyValidation;
                if(this.validate()) return this.stepStatus('incomplete');
            }

            if (!this.isMultiShipMode() && this.getCheckout().get('destinations').nonGiftCardDestinations().length < 2) {
                this.validation = this.singleShippingAddressValidation;
                if(this.validate()) return this.stepStatus('incomplete');
            }

            this.validation = this.multiShipValidation;

            if(!this.validate()) return this.stepStatus('complete');

            return CheckoutStep.prototype.calculateStepStatus.apply(this);
        },
        validateModel: function() {
                this.validation = this.multiShipValidation;
                var validationObj = this.validate();
                if(this.requiresDigitalFulfillmentContact()){
                     var digitalValid = this.digitalGiftCardValid();
                     if(!digitalValid) { return false; }
                }
                if (this.requiresFulfillmentInfo() && validationObj) {
                    if (!this.isMultiShipMode() && this.getCheckout().get('destinations').nonGiftCardDestinations().length < 2) {
                        this.singleShippingAddressValid();
                        return false;
                    }
                    if (!this.get("isMultiShipMode")) {
                        var isValid = this.selectedDestination();
                        var errorMsgDOM = document.getElementsByClassName("shipping-contact-id")[0];
                        if (typeof errorMsgDOM !== "undefined") {
                            if (!isValid) {
                               this.parent.get('destinations').singleShippingDestination().set('shippingError',true);
                            }else{
                               this.parent.get('destinations').singleShippingDestination().set('shippingError',false);
                            }
                            this.trigger('render');
                        }
                    }
                    /*Object.keys(validationObj.ShippingDestinations).forEach(function(key) {
                        Object.keys(validationObj.ShippingDestinations[key]).forEach(function(keyLevel2) {
                            this.trigger('error', {
                                message: validationObj.ShippingDestinations[key][keyLevel2]
                            });
                        }, this);
                    }, this);*/
                    return false;
                }
                return true;
            },
            completeStep : function(){
                var self = this;
                var checkout = self.getCheckout();

                checkout.messages.reset();
                checkout.syncApiModel();

                if (self.requiresDigitalFulfillmentContact()) {
                    if(!self.saveDigitalGiftCard()) {
                        return false;
                    }
                }

                if(self.requiresFulfillmentInfo()){
                    self.isLoading(true);
                    checkout.get('shippingInfo').updateShippingMethods().then(function(methods) {
                        if(methods){
                            var defaults = checkout.get('shippingInfo').shippingMethodDefaults();
                            if(defaults.length){
                                checkout.get('shippingInfo').setDefaultShippingMethodsAsync(defaults).ensure(function(){
                                     self.getCheckout().get('shippingInfo').stepStatus('incomplete');
                                });
                            } else {
                                 self.getCheckout().get('shippingInfo').isLoading(false);
                                 self.getCheckout().get('shippingInfo').calculateStepStatus();
                            }
                        }
                    }).ensure(function(){
                        self.isLoading(false);
                        self.stepStatus('complete');
                        checkout.get('shippingInfo').calculateStepStatus();
                    });
                } else {
                   self.stepStatus('complete');
                   checkout.get('billingInfo').calculateStepStatus();
                }
            },
            // Breakup for validation
            // Break for compelete step
            next: function() {
                var self = this;


                if(self.requiresFulfillmentInfo()){
                    if (!this.isMultiShipMode() && this.getCheckout().get('destinations').nonGiftCardDestinations().length < 2) {
                        return self.nextSingleShippingAddress();
                    }

                    if (!self.validateModel()) {
                      return false;
                    }

                }

                self.completeStep();
            }
    });

    return ShippingStep;
});

define('modules/checkout/steps/step2/models-step-shipping-methods',[
    'modules/jquery-mozu',
    'underscore',
    'hyprlive',
    'modules/backbone-mozu',
    'modules/api',
    'hyprlivecontext',
    'modules/checkout/steps/models-base-checkout-step'
],
function ($, _, Hypr, Backbone, api, HyprLiveContext, CheckoutStep) {

    var FulfillmentInfo = CheckoutStep.extend({ 
            helpers : ['groupings'],
            validation: {
                ShippingMethods :{
                    fn: function(value, attr){
                        var shippingErrors = [];
                        this.parent.get('groupings').forEach(function(item, idx){
                            var itemValid = item.validate();
                            if (itemValid) {
                                shippingErrors.push(itemValid);
                            }
                        });
                        return (shippingErrors.length) ? shippingErrors : false;
                    }
                }
            },
            getCheckout: function() {
                return this.parent;
            },
            groupings : function(){
                var groups = [];
                this.getCheckout().get('groupings').each(function(group){ 
                    groups.push(group.toJSON({ helpers: true }));
                });
                return groups;
            },
            refreshShippingMethods: function (methods) {
                if(this.parent.get('shippingMethods')) {
                    this.parent.get('shippingMethods').reset();
                    this.parent.get('shippingMethods').add(methods);
                    return;
                }
                this.parent.set('shippingMethods', methods);
            },
            updateShippingMethods : function(){
                var self = this;
                return this.getCheckout().apiGetAvaiableShippingMethods().then(function (methods) {
                    self.refreshShippingMethods(methods);
                    return methods;
                    //self.trigger('shippingInfoUpdated');     
                    //self.calculateStepStatus();
                });
            },
            //
            //Break  this guy up we need to be able to return a promise to determine when to calculate Step status.
            //
            //
            //
            shippingMethodDefaults:function(){
                var self = this;

                var shippingMethodDefaults = [];
                self.getCheckout().get('groupings').each(function(group){

                    var methods = self.getCheckout().get('shippingMethods').findWhere({groupingId :group.id});

                    if(methods){
                        if(group.get('shippingMethodCode')){
                            var selectedMethod = _.findWhere(methods.get('shippingRates'), {shippingMethodCode :group.get('shippingMethodCode')});
                            if(selectedMethod) { return; } 
                        }
                        var lowestShippingRate = _.min(methods.get('shippingRates'), function(method){return method.price;});
                        shippingMethodDefaults.push({groupingId: group.id, shippingRate: lowestShippingRate});
                    }
                });
                return shippingMethodDefaults;
            },
            setDefaultShippingMethodsAsync : function(shippingMethodsPayload){
                var self = this;
                if (typeof(shippingMethodsPayload) !== 'object') shippingMethodsPayload = [];

                self.getCheckout().get('shippingInfo').isLoading(true);
                return self.getCheckout().apiSetShippingMethods({id: self.getCheckout().get('id'), postdata: shippingMethodsPayload}).ensure(function(){
                    self.isLoading(false);
                    self.getCheckout().get('shippingInfo').isLoading(false);
                });
            },
            validateModel: function() {
                var validationObj = this.validate();

                if (validationObj) {
                    Object.keys(validationObj.ShippingMethods).forEach(function(key) {
                        Object.keys(validationObj.ShippingMethods[key]).forEach(function(keyLevel2) {
                            this.trigger('error', {
                                message: validationObj.ShippingMethods[key][keyLevel2]
                            });
                        }, this);
                    }, this);

                    return false;
                }
                return true;
            },
            calculateStepStatus: function () {
                // If no shipping required, we're done.
                if (!this.requiresFulfillmentInfo()) return this.stepStatus('complete');

                // If there's no shipping address yet, go blank.
                if (this.parent.get('shippingStep').stepStatus() !== 'complete') {
                    return this.stepStatus('new'); 
                }

                if(this.validate()) {
                   return this.stepStatus('incomplete'); 
                }

                // Incomplete status for shipping is basically only used to show the Shipping Method's Next button,
                // which does nothing but show the Payment Info step.
                // var billingInfo = this.parent.get('billingInfo');
                 if (!this.parent.get('billingInfo') || this.parent.get('billingInfo').stepStatus() === 'new') return this.stepStatus('incomplete');

                // Payment Info step has been initialized. Complete status hides the Shipping Method's Next button.
                return CheckoutStep.prototype.calculateStepStatus.apply(this);
            },
            next: function () {
                if(!this.validateModel()) {
                   return false; 
                }

                this.stepStatus('complete');
                this.parent.get('billingInfo').calculateStepStatus();
            }
        });
    return FulfillmentInfo;
});
define('modules/checkout/steps/step3/models-payment',[
    'modules/jquery-mozu',
    'underscore',
    'hyprlive',
    'modules/backbone-mozu',
    'modules/api',
    'modules/models-customer',
    'modules/models-address',
    'modules/models-paymentmethods',
    'hyprlivecontext',
    'modules/checkout/steps/models-base-checkout-step',
    'modules/checkout/models-shipping-destinations'
],
    function ($, _, Hypr, Backbone, api, CustomerModels, AddressModels, PaymentMethods, HyprLiveContext, CheckoutStep, ShippingDestinations) {

        var CustomerBillingContact = CustomerModels.Contact.extend({
            hasRequiredBehavior: function(){
                 return true;
             }
         }),

        BillingInfo = CheckoutStep.extend({
            mozuType: 'payment',
            validation: {
                paymentType: {
                    fn: "validatePaymentType"
                },
                savedPaymentMethodId: {
                    fn: "validateSavedPaymentMethodId"
                },
                "contactId": {
                    fn: "validateBillingAddress"
                },
                'billingContact.email': {
                    pattern: 'email',
                    msg: Hypr.getLabel('emailMissing')
                }
            },
            dataTypes: {
                'isSameBillingShippingAddress': Backbone.MozuModel.DataTypes.Boolean,
                'creditAmountToApply': Backbone.MozuModel.DataTypes.Float
            },
            relations: {
                billingContact: CustomerBillingContact,
                card: PaymentMethods.CreditCardWithCVV,
                check: PaymentMethods.Check,
                purchaseOrder: PaymentMethods.PurchaseOrder
            },
            validateBillingAddress: function () {
                var isValid = this.selectedBillingDestination();
                if (!isValid && $('[data-mz-value="contactId"]:visible').length)
                    return Hypr.getLabel('billingAddressRequired');
            },
            validatePaymentType: function(value, attr) {
                var order = this.getOrder();
                var payment = order.apiModel.getCurrentPayment();
                var errorMessage = Hypr.getLabel('paymentTypeMissing');
                if (!value) return errorMessage;
                if ((value === "StoreCredit" || value === "GiftCard") && this.nonStoreCreditOrGiftCardTotal() > 0 && !payment) return errorMessage;

            },
            validateSavedPaymentMethodId: function (value, attr, computedState) {
                if (this.get('usingSavedCard')) {
                    var isValid = this.get('savedPaymentMethodId');
                    if (!isValid) return Hypr.getLabel('selectASavedCard');
                }

            },
            helpers: ['acceptsMarketing', 'savedPaymentMethods', 'availableStoreCredits', 'applyingCredit', 'maxCreditAmountToApply',
              'activeStoreCredits', 'activeGiftCards', 'nonStoreCreditOrGiftCardTotal', 'activePayments', 'hasSavedCardPayment', 'availableDigitalCredits', 'availableGiftCards',
              'digitalCreditPaymentTotal', 'giftCardPaymentTotal', 'isAnonymousShopper', 'visaCheckoutFlowComplete','isExternalCheckoutFlowComplete', 'selectedBillingDestination',
              'selectableDestinations'],
            acceptsMarketing: function () {
                return this.getOrder().get('acceptsMarketing');
            },
            isExternalCheckoutFlowComplete: function () {
                // we check for token payment type because tokens technically are external workflows but their paymentWorkflow will always be Mozu.
                return this.get('paymentWorkflow') !== "Mozu" || this.get("paymentType") == "token";
            },
            visaCheckoutFlowComplete: function() {
                return this.get('paymentWorkflow') === 'VisaCheckout';
            },
            cancelExternalCheckout: function () {
                var self = this;
                var order = this.getOrder();
                var currentPayment = order.apiModel.getCurrentPayment();
                return order.apiVoidPayment(currentPayment.id).then(function() {
                    self.clear();
                    self.stepStatus('incomplete');
                    // need to re-enable purchase order information if purchase order is available.
                    self.setPurchaseOrderInfo();
                    // Set the defualt payment method for the customer.
                    self.setDefaultPaymentType(self);
                });
            },
            activePayments: function () {
                return this.getOrder().apiModel.getActivePayments();
            },
            hasSavedCardPayment: function() {
                var currentPayment = this.getOrder().apiModel.getCurrentPayment();
                return !!(currentPayment && currentPayment.billingInfo.card && currentPayment.billingInfo.card.paymentServiceCardId);
            },
            nonStoreCreditOrGiftCardTotal: function () {
              var me = this,
                  order = this.getOrder(),
                  total = order.get('total'),
                  result,
                  activeGiftCards = this.activeGiftCards(),
                  activeCredits = this.activeStoreCredits();

                  if (!activeGiftCards && !activeCredits) return total;

                  var giftCardTotal = _.reduce(activeGiftCards || [], function(sum, giftCard) {
                      return sum + giftCard.amountRequested;
                  }, 0);

                  var storeCreditTotal = _.reduce(activeCredits || [], function (sum, credit){
                      return sum + credit.amountRequested;
                  }, 0);

                  result = total - giftCardTotal - storeCreditTotal;
                  return me.roundToPlaces(result, 2);
            },
            resetAddressDefaults: function () {
                var billingAddress = this.get('billingContact').get('address');
                var addressDefaults = billingAddress.defaults;
                billingAddress.set('countryCode', addressDefaults.countryCode);
                billingAddress.set('addressType', addressDefaults.addressType);
                billingAddress.set('candidateValidatedAddresses', addressDefaults.candidateValidatedAddresses);
            },
            savedPaymentMethods: function () {
                var cards = this.getOrder().get('customer').get('cards').toJSON();
                return cards && cards.length > 0 && cards;
            },
            activeStoreCredits: function () {
                var active = this.getOrder().apiModel.getActiveStoreCredits();
                return active && active.length > 0 && active;
            },
            activeGiftCards: function() {
              var active = this.getOrder().apiModel.getActiveGiftCards();
              return active && active.length > 0 && active;
            },
            availableStoreCredits: function () {
                var order = this.getOrder(),
                    customer = order.get('customer'),
                    credits = customer && customer.get('credits'),
                    usedCredits = this.activeStoreCredits(),
                    availableCredits = credits && _.compact(_.map(credits.models, function (credit) {
                        if (!(credit.creditType === 'StoreCredit' || credit.creditType === 'GiftCard'))
                            return false;
                        credit = _.clone(credit);
                        if (usedCredits) _.each(usedCredits, function (uc) {
                            if (uc.billingInfo.storeCreditCode === credit.code) {
                                credit.currentBalance -= uc.amountRequested;
                            }
                        });
                        return credit.currentBalance > 0 ? credit : false;
                    }));
                return availableCredits && availableCredits.length > 0 && availableCredits;
            },
            selectableDestinations : function() {
                return this.getOrder().selectableDestinations("Billing");
            },
            applyingCredit: function () {
                return this._applyingCredit;
            },
            maxCreditAmountToApply: function () {
                var order = this.getOrder(),
                    total = order.get('amountRemainingForPayment'),
                    applyingCredit = this.applyingCredit();
                if (applyingCredit) return Math.min(applyingCredit.currentBalance, total).toFixed(2);
            },
            beginApplyCredit: function () {
                var selectedCredit = this.get('selectedCredit');
                this._oldPaymentType = this.get('paymentType');
                if (selectedCredit) {
                    var applyingCredit = _.findWhere(this.availableStoreCredits(), { code: selectedCredit });
                    if (applyingCredit) {
                        this._applyingCredit = applyingCredit;
                        this.set('creditAmountToApply', this.maxCreditAmountToApply());
                    }
                }
            },
            closeApplyCredit: function () {
                delete this._applyingCredit;
                this.unset('selectedCredit');
                this.set('paymentType', this._oldPaymentType);
            },
            finishApplyCredit: function () {
                var self = this,
                    order = self.getOrder();
                return order.apiAddStoreCredit({
                    storeCreditCode: this.get('selectedCredit'),
                    amount: this.get('creditAmountToApply')
                }).then(function (o) {
                    order.set(o.data);
                    self.closeApplyCredit();
                    return order.update();
                });
            },
            // digital

            onCreditAmountChanged: function(digCredit, amt) {
                this.applyDigitalCredit(digCredit.get('code'), amt);
            },

            loadCustomerDigitalCredits: function () {
                var self = this,
                    order = this.getOrder(),
                    customer = order.get('customer'),
                    activeCredits = this.activeStoreCredits();

                var customerCredits = customer.get('credits');
                if (customerCredits && customerCredits.length > 0) {
                    var currentDate = new Date(),
                        unexpiredDate = new Date(2076, 6, 4);

                    // todo: refactor so conversion & get can re-use - Greg Murray on 2014-07-01
                    var invalidCredits = customerCredits.filter(function(cred) {
                        var credBalance = cred.get('currentBalance'),
                            credExpDate = cred.get('expirationDate');
                        var expDate = (credExpDate) ? new Date(credExpDate) : unexpiredDate;
                        return (!credBalance || credBalance <= 0 || expDate < currentDate);
                    });
                    _.each(invalidCredits, function(inv) {
                        customerCredits.remove(inv);
                    });
                }
                self._cachedDigitalCredits = customerCredits;

                if (activeCredits) {
                    var userEnteredCredits = _.filter(activeCredits, function(activeCred) {
                        var existingCustomerCredit = self._cachedDigitalCredits.find(function(cred) {
                            return cred.get('code').toLowerCase() === activeCred.billingInfo.storeCreditCode.toLowerCase();
                        });
                        if (!existingCustomerCredit) {
                            return true;
                        }
                        //apply pricing update.
                        existingCustomerCredit.set('isEnabled', true);
                        existingCustomerCredit.set('creditAmountApplied', activeCred.amountRequested);
                        existingCustomerCredit.set('remainingBalance', existingCustomerCredit.calculateRemainingBalance());
                        return false;
                    });
                    if (userEnteredCredits) {
                        this.convertPaymentsToDigitalCredits(userEnteredCredits, customer);
                    }
                }

            },

            convertPaymentsToDigitalCredits: function(activeCredits, customer) {
                var me = this;
                _.each(activeCredits, function (activeCred) {
                    var currentCred = activeCred;
                    return me.retrieveDigitalCredit(customer, currentCred.billingInfo.storeCreditCode, me, currentCred.amountRequested).then(function(digCredit) {
                        me.trigger('orderPayment', me.getOrder().data, me);
                        return digCredit;
                    });
                });
            },
            availableDigitalCredits: function () {
                if (! this._cachedDigitalCredits) {
                    this.loadCustomerDigitalCredits();
                }
                return this._cachedDigitalCredits && this._cachedDigitalCredits.length > 0 && this._cachedDigitalCredits;
            },
            refreshBillingInfoAfterAddingStoreCredit: function (order, updatedOrder) {
                var self = this;
                //clearing existing order billing info because information may have been removed (payment info) #68583

                // #73389 only refresh if the payment requirement has changed after adding a store credit.
                var activePayments = this.activePayments();
                var hasNonStoreCreditPayment = (_.filter(activePayments, function (item) { return item.paymentType !== 'StoreCredit'; })).length > 0;
                if ((order.get('amountRemainingForPayment') >= 0 && !hasNonStoreCreditPayment) ||
                    (order.get('amountRemainingForPayment') < 0 && hasNonStoreCreditPayment))
                {
                    var billingContactEmail = this.get('billingContact').get('email');
                    order.get('billingInfo').clear();
                    order.get('billingInfo').set('email', billingContactEmail);
                    order.set(updatedOrder, { silent: true });
                }
                self.getPaymentTypeFromCurrentPayment();
                self.setPurchaseOrderInfo();
                self.setDefaultPaymentType(self);
                self.trigger('orderPayment', updatedOrder, self);

            },

            applyDigitalCredit: function (creditCode, creditAmountToApply, isEnabled) {
                var self = this,
                    order = self.getOrder(),
                    maxCreditAvailable = null;

                this._oldPaymentType = this.get('paymentType');
                var digitalCredit = this._cachedDigitalCredits.filter(function(cred) {
                     return cred.get('code').toLowerCase() === creditCode.toLowerCase();
                });

                if (! digitalCredit || digitalCredit.length === 0) {
                    return self.deferredError(Hypr.getLabel('digitalCodeAlreadyUsed', creditCode), self);
                }
                digitalCredit = digitalCredit[0];
                var previousAmount = digitalCredit.get('creditAmountApplied');
                var previousEnabledState = digitalCredit.get('isEnabled');

                if (!creditAmountToApply && creditAmountToApply !== 0) {
                    creditAmountToApply = self.getMaxCreditToApply(digitalCredit, self);
                }

                digitalCredit.set('creditAmountApplied', creditAmountToApply);
                digitalCredit.set('remainingBalance',  digitalCredit.calculateRemainingBalance());
                digitalCredit.set('isEnabled', isEnabled);

                //need to round to prevent being over total by .01
                if (creditAmountToApply > 0) {
                    creditAmountToApply = self.roundToPlaces(creditAmountToApply, 2);
                }

                var activeCreditPayments = this.activeStoreCredits();
                if (activeCreditPayments) {
                    //check if payment applied with this code, remove
                    var sameCreditPayment = _.find(activeCreditPayments, function (cred) {
                        return cred.status !== 'Voided' && cred.billingInfo && cred.billingInfo.storeCreditCode.toLowerCase() === creditCode.toLowerCase();
                    });

                    if (sameCreditPayment) {
                        if (this.areNumbersEqual(sameCreditPayment.amountRequested, creditAmountToApply)) {
                            var deferredSameCredit = api.defer();
                            deferredSameCredit.reject();
                            return deferredSameCredit.promise;
                        }
                        if (creditAmountToApply === 0) {
                            return order.apiVoidPayment(sameCreditPayment.id).then(function(o) {
                                order.set(o.data);
                                self.setPurchaseOrderInfo();
                                self.setDefaultPaymentType(self);
                                self.trigger('orderPayment', o.data, self);
                                return o;
                            });
                        } else {
                            maxCreditAvailable = self.getMaxCreditToApply(digitalCredit, self, sameCreditPayment.amountRequested);
                            if (creditAmountToApply > maxCreditAvailable) {
                                digitalCredit.set('creditAmountApplied', previousAmount);
                                digitalCredit.set('isEnabled', previousEnabledState);
                                digitalCredit.set('remainingBalance', digitalCredit.calculateRemainingBalance());
                                return self.deferredError(Hypr.getLabel('digitalCreditExceedsBalance'), self);
                            }
                            return order.apiVoidPayment(sameCreditPayment.id).then(function (o) {
                                order.set(o.data);

                                return order.apiAddStoreCredit({
                                    storeCreditCode: creditCode,
                                    amount: creditAmountToApply
                                }).then(function (o) {
                                    self.refreshBillingInfoAfterAddingStoreCredit(order, o.data);
                                    return o;
                                });
                            });
                        }
                    }
                }

                if (creditAmountToApply === 0) {
                    return this.getOrder();
                }

                maxCreditAvailable = self.getMaxCreditToApply(digitalCredit, self);
                if (creditAmountToApply > maxCreditAvailable) {
                    digitalCredit.set('creditAmountApplied', previousAmount);
                    digitalCredit.set('remainingBalance', digitalCredit.calculateRemainingBalance());
                    digitalCredit.set('isEnabled', previousEnabledState);
                    return self.deferredError(Hypr.getLabel('digitalCreditExceedsBalance'), self);
                }

                return order.apiAddStoreCredit({
                    storeCreditCode: creditCode,
                    amount: creditAmountToApply,
                    email: self.get('billingContact').get('email')
                }).then(function (o) {
                    self.refreshBillingInfoAfterAddingStoreCredit(order, o.data);
                    return o;
                });
            },

            deferredError: function deferredError(msg, scope) {
                scope.trigger('error', {
                    message: msg
                });
                var deferred = api.defer();
                deferred.reject();

                return deferred.promise;
            },
            areNumbersEqual: function(f1, f2) {
                var epsilon = 0.01;
                return (Math.abs(f1 - f2)) < epsilon;
            },
            loadGiftCards: function(){
              //TODO: phase 2: get giftCards from customer account

              // gets gift card payments from order, populates our gift card grid cache,
              // complete with balance calls
              var me = this;
              var activeGiftCards = this.activeGiftCards();

              if (activeGiftCards) {
                var numberOfGiftCards = activeGiftCards.length;
                var counter = 0;
                activeGiftCards.forEach(function(giftCardPayment){
                    var newGiftCardModel = new PaymentMethods.GiftCard(giftCardPayment.billingInfo.card);
                      newGiftCardModel.apiGetBalance().then(function(res){
                          var balance = res.data.balance;
                          if (balance > 0){
                            newGiftCardModel.set('isEnabled', true);
                            newGiftCardModel.set('amountApplied', giftCardPayment.amountRequested);
                            newGiftCardModel.set('currentBalance', balance);
                            newGiftCardModel.set('remainingBalance', newGiftCardModel.calculateRemainingBalance());
                            me._cachedGiftCards.push(newGiftCardModel);
                          }
                          counter ++;
                          if (counter==numberOfGiftCards){
                              me.trigger('render');
                          }
                        }
                      );

                });
              }
            },
            applyGiftCard: function(giftCardId, amountToApply, isEnabled){
              var self = this, order = this.getOrder();
              //get gift card by id from _giftCardCache
              var giftCardModel = this._cachedGiftCards.find(function(giftCard){
                  return giftCard.get('id') === giftCardId;
              });
              //TODO: what do we do if it's not in the cache?
              // realistically, we shouldn't be at this point if it's not in the cache.

              var previousAmount = giftCardModel.get('amountApplied');
              var previousEnabledState = giftCardModel.get('isEnabled');

              if (!amountToApply && amountToApply !== 0) {
                  amountToApply = self.getMaxCreditToApply(giftCardModel, self);
              }

              if (amountToApply > 0) {
                  amountToApply = self.roundToPlaces(amountToApply, 2);
              }

              var activeGiftCards = this.activeGiftCards();
              if (activeGiftCards) {
                  var sameGiftCard = _.find(activeGiftCards, function(giftCard){
                      return giftCard.status != 'Voided' && giftCard.billingInfo.card.paymentServiceCardId == giftCardId;
                  });

                  if (sameGiftCard){
                    if (this.areNumbersEqual(sameGiftCard.amountRequested, amountToApply)) {
                        var deferredSameGiftCard = api.defer();
                        deferredSameGiftCard.reject();
                        return deferredSameGiftCard.promise;
                    }
                    if (amountToApply === 0) {
                        return order.apiVoidPayment(sameGiftCard.id).then(function(o) {
                            order.set(o.data);
                            self.setPurchaseOrderInfo();
                            //self.setDefaultPaymentType(self);
                            // TODO: figure out if this is needed?
                            giftCardModel.set('amountApplied', amountToApply);
                            giftCardModel.set('isEnabled', isEnabled);
                            giftCardModel.set('remainingBalance', giftCardModel.calculateRemainingBalance());
                            self.trigger('orderPayment', o.data, self);
                            return o;
                        });
                    } else {
                        maxCreditAvailable = self.getMaxCreditToApply(giftCardModel, self, sameGiftCard.amountRequested);
                        if (amountToApply > maxCreditAvailable) {
                            giftCardModel.set('amountApplied', previousAmount);
                            giftCardModel.set('isEnabled', previousEnabledState);
                            giftCardModel.set('remainingBalance', giftCardModel.calculateRemainingBalance());
                            return self.deferredError(Hypr.getLabel('digitalCreditExceedsBalance'), self);
                        }
                        return order.apiVoidPayment(sameGiftCard.id).then(function (o) {
                            order.set(o.data);
                            giftCardModel.set('amountToApply', amountToApply);
                            return order.apiAddGiftCard(giftCardModel.toJSON()).then(function (o) {
                                giftCardModel.set('amountApplied', amountToApply);
                                giftCardModel.set('isEnabled', isEnabled);
                                giftCardModel.set('remainingBalance', giftCardModel.calculateRemainingBalance());
                                self.refreshBillingInfoAfterAddingStoreCredit(order, o.data);
                                return o;
                            });
                        });
                    }
                }
            }
            if (amountToApply === 0) {
                return this.getOrder();
            }
            var maxCreditAvailable = self.getMaxCreditToApply(giftCardModel, self);
            if (amountToApply > maxCreditAvailable) {
                giftCardModel.set('amountApplied', previousAmount);
                giftCardModel.set('remainingBalance', giftCardModel.calculateRemainingBalance());
                giftCardModel.set('isEnabled', previousEnabledState);
                return self.deferredError(Hypr.getLabel('digitalCreditExceedsBalance'), self);
            }

            giftCardModel.set('amountToApply', amountToApply);
            return order.apiAddGiftCard(giftCardModel.toJSON()).then(function(data){
                giftCardModel.set('amountApplied', amountToApply);
                giftCardModel.set('remainingBalance', giftCardModel.calculateRemainingBalance());
                giftCardModel.set('isEnabled', isEnabled);
                //TODO: see if giftCardModel is changed by syncApiModel
                //TODO: maybe update the order to represent the return from this?
                self.syncApiModel();
                self.trigger('render');
              }, function(error){
                  //window.console.log(error);
              });

            },
            retrieveGiftCard: function(number, securityCode) {
              var me = this;
              this.syncApiModel();
              var giftCardModel = new PaymentMethods.GiftCard( {cardNumber: number, cvv: securityCode, cardType: "GIFTCARD", isEnabled: true });
              me.isLoading(true);
              return giftCardModel.apiGetBalanceUnregistered().then(function(res){
                  if (!res.data.isSuccessful){
                      me.isLoading(false);
                      me.trigger('error', {
                          message: res.data.message
                      });
                      return;
                  }
                  var balance = res.data.balance;
                  if (balance>0){
                      return giftCardModel.apiSave().then(function(giftCard){
                          if (!giftCardModel.get('id')) giftCardModel.set('id', giftCardModel.get('paymentServiceCardId'));
                          giftCardModel.set('currentBalance', balance);
                          me._cachedGiftCards.push(giftCardModel.clone());
                          return me.applyGiftCard(giftCardModel.get('id'), null, true);
                      }, function(error){
                        //Error with apiSave.
                        me.trigger('error',{
                            message: Hypr.getLabel('giftCardPaymentServiceError')
                        });
                      });
                  } else {
                      me.isLoading(false);
                      // No balance error
                      me.trigger('error', {
                          message: Hypr.getLabel('giftCardNoBalance')
                      });
                  }
              }, function(error){
                me.isLoading(false);
                me.trigger('error', {
                    message: Hypr.getLabel('giftCardBalanceError')
                });
              });
            },
            getGatewayGiftCard: function() {
                var me = this,
                giftCardNumber = this.get('giftCardNumber'),
                giftCardSecurityCode = this.get('giftCardSecurityCode');

                //Our only option for checking if a card already exists, for now,
                //is to only compare the last 4 digits.
                var existingGiftCard = this._cachedGiftCards.filter(function (card) {
                    var cachedCardLast4 = card.get('cardNumber').slice(-4);
                    var newCardLast4 = giftCardNumber.slice(-4);
                    return cachedCardLast4 === newCardLast4;
                });

                if (existingGiftCard && existingGiftCard.length > 0) {
                    me.trigger('error', {
                        message: Hypr.getLabel('giftCardAlreadyAdded')
                    });
                    me.isLoading(false);
                    return me;
                } else {
                    return me.retrieveGiftCard(giftCardNumber, giftCardSecurityCode).ensure(function(res){
                      me.isLoading(false);
                      return me;
                    });
                }
            },
            availableGiftCards: function(){
              return this._cachedGiftCards && this._cachedGiftCards.length > 0 && this._cachedGiftCards;
            },
            retrieveDigitalCredit: function (customer, creditCode, me, amountRequested) {
                var self = this;
                return customer.apiGetDigitalCredit(creditCode).then(function (credit) {
                    var creditModel = new PaymentMethods.DigitalCredit(credit.data);
                    creditModel.set('isTiedToCustomer', false);

                    var validateCredit = function() {
                        var now = new Date(),
                            activationDate = creditModel.get('activationDate') ? new Date(creditModel.get('activationDate')) : null,
                            expDate = creditModel.get('expirationDate') ? new Date(creditModel.get('expirationDate')) : null;
                        if (expDate && expDate < now) {
                            return self.deferredError(Hypr.getLabel('expiredCredit', expDate.toLocaleDateString()), self);
                        }
                        if (activationDate && activationDate > now) {
                            return self.deferredError(Hypr.getLabel('digitalCreditNotYetActive', activationDate.toLocaleDateString()), self);
                        }
                        if (!creditModel.get('currentBalance') || creditModel.get('currentBalance') <= 0) {
                            return self.deferredError(Hypr.getLabel('digitalCreditNoRemainingFunds'), self);
                        }
                        return null;
                    };

                    var validate = validateCredit();
                    if (validate !== null) {
                        return null;
                    }

                    var maxAmt = me.getMaxCreditToApply(creditModel, me, amountRequested);
                    if (!!amountRequested && amountRequested < maxAmt) {
                        maxAmt = amountRequested;
                    }
                    creditModel.set('creditAmountApplied', maxAmt);
                    creditModel.set('remainingBalance', creditModel.calculateRemainingBalance());
                    creditModel.set('isEnabled', true);

                    me._cachedDigitalCredits.push(creditModel);
                    me.applyDigitalCredit(creditCode, maxAmt, true);
                    me.trigger('sync', creditModel);
                    return creditModel;
                });
            },

            getDigitalCredit: function () {
                var me = this,
                    order = me.getOrder(),
                    customer = order.get('customer');
                var creditCode = this.get('digitalCreditCode');

                var existingDigitalCredit = this._cachedDigitalCredits.filter(function (cred) {
                    return cred.get('code').toLowerCase() === creditCode.toLowerCase();
                });
                if (existingDigitalCredit && existingDigitalCredit.length > 0){
                    me.trigger('error', {
                        message: Hypr.getLabel('digitalCodeAlreadyUsed', creditCode)
                    });
                    // to maintain promise api
                    var deferred = api.defer();
                    deferred.reject();
                    return deferred.promise;
                }
                me.isLoading(true);
                return me.retrieveDigitalCredit(customer, creditCode, me).ensure(function() {
                    me.isLoading(false);
                    return me;
                });
            },

            getMaxCreditToApply: function(creditModel, scope, toBeVoidedPayment) {
                var remainingTotal = scope.nonStoreCreditOrGiftCardTotal();
                if (!!toBeVoidedPayment) {
                    remainingTotal += toBeVoidedPayment;
                }
                var maxAmt = remainingTotal < creditModel.get('currentBalance') ? remainingTotal : creditModel.get('currentBalance');
                return scope.roundToPlaces(maxAmt, 2);
            },
            roundToPlaces: function(amt, numberOfDecimalPlaces) {
                var transmogrifier = Math.pow(10, numberOfDecimalPlaces);
                return Math.round(amt * transmogrifier) / transmogrifier;
            },

            digitalCreditPaymentTotal: function () {
                var activeCreditPayments = this.activeStoreCredits();
                if (!activeCreditPayments)
                    return null;
                return _.reduce(activeCreditPayments, function (sum, credit) {
                    return sum + credit.amountRequested;
                }, 0);
            },

            giftCardPaymentTotal: function () {
                var activeGiftCards = this.activeGiftCards();
                if (!activeGiftCards)
                    return null;
                return _.reduce(activeGiftCards, function (sum, giftcard) {
                    return sum + giftcard.amountRequested;
                }, 0);
            },

            addRemainingCreditToCustomerAccount: function(creditCode, isEnabled) {
                var self = this;

                var digitalCredit = self._cachedDigitalCredits.find(function(credit) {
                    return credit.code.toLowerCase() === creditCode.toLowerCase();
                });

                if (!digitalCredit) {
                    return self.deferredError(Hypr.getLabel('genericNotFound'), self);
                }
                digitalCredit.set('addRemainderToCustomer', isEnabled);
                return digitalCredit;
            },

            getDigitalCreditsToAddToCustomerAccount: function() {
                return this._cachedDigitalCredits.where({ isEnabled: true, addRemainderToCustomer: true, isTiedToCustomer: false });
            },

            isAnonymousShopper: function() {
                var order = this.getOrder(),
                    customer = order.get('customer');
                return (!customer || !customer.id || customer.id <= 1);
            },

            removeCredit: function(id) {
                var order = this.getOrder();
                return order.apiVoidPayment(id).then(order.update);
            },
            syncPaymentMethod: function (me, newId) {
                if (!newId || newId === 'new') {
                    me.get('billingContact').clear();
                    me.get('card').clear();
                    me.get('check').clear();
                    me.unset('paymentType');
                    me.set('usingSavedCard', false);
                } else {
                    me.setSavedPaymentMethod(newId);
                    me.set('usingSavedCard', true);
                }
            },
            setSavedPaymentMethod: function (newId, manualCard) {
                var me = this,
                    customer = me.getOrder().get('customer'),
                    card = manualCard || customer.get('cards').get(newId),
                    cardBillingContact = card && customer.get('contacts').get(card.get('contactId'));
                if (card) {
                    me.get('billingContact').set(cardBillingContact.toJSON(), { silent: true });
                    me.get('card').set(card.toJSON());
                    me.set('paymentType', 'CreditCard');
                    me.set('usingSavedCard', true);
                    if (Hypr.getThemeSetting('isCvvSuppressed')) {
                        me.get('card').set('isCvvOptional', true);
                        if (me.parent.get('amountRemainingForPayment') > 0) {
                            return me.applyPayment();
                        }
                    }
                }
            },
            getPaymentTypeFromCurrentPayment: function () {
                var activeStoreCredits = this.getOrder().apiModel.getActiveStoreCredits(),
                    billingInfoPaymentType = this.get('paymentType'),
                    billingInfoPaymentWorkflow = this.get('paymentWorkflow'),
                    currentPayment = this.getOrder().apiModel.getCurrentPayment(),
                    currentPaymentType = currentPayment && currentPayment.billingInfo.paymentType,
                    currentPaymentWorkflow = currentPayment && currentPayment.paymentWorkflow,
                    currentBillingContact = currentPayment && currentPayment.billingInfo.billingContact,
                    currentCard = currentPayment && currentPayment.billingInfo.card,
                    currentPurchaseOrder = currentPayment && currentPayment.billingInfo.purchaseorder,
                    purchaseOrderSiteSettings = HyprLiveContext.locals.siteContext.checkoutSettings.purchaseOrder ?
                        HyprLiveContext.locals.siteContext.checkoutSettings.purchaseOrder.isEnabled : false,
                    purchaseOrderCustomerSettings = this.getOrder().get('customer').get('purchaseOrder') ?
                        this.getOrder().get('customer').get('purchaseOrder').isEnabled : false;

                if(purchaseOrderSiteSettings && purchaseOrderCustomerSettings && !currentPayment) {
                    currentPaymentType = 'PurchaseOrder';
                }

                if (currentPaymentType && (currentPaymentType !== billingInfoPaymentType || currentPaymentWorkflow !== billingInfoPaymentWorkflow)) {
                    this.set('paymentType', currentPaymentType );
                    this.set('paymentWorkflow', currentPaymentWorkflow, { silent: true });
                    this.set('card', currentCard, { silent: true });
                    this.set('billingContact', currentBillingContact, { silent: true });
                    this.set('purchaseOrder', currentPurchaseOrder, { silent: true });
                }
            },
            edit: function () {
                this.getPaymentTypeFromCurrentPayment();
                CheckoutStep.prototype.edit.apply(this, arguments);
            },
            updatePurchaseOrderAmount: function() {

                var me = this,
                    order = me.getOrder(),
                    currentPurchaseOrder = this.get('purchaseOrder'),
                    pOAvailableBalance = currentPurchaseOrder.get('totalAvailableBalance'),
                    orderAmountRemaining = order.get('amountRemainingForPayment'),
                    amount = pOAvailableBalance > orderAmountRemaining ?
                        orderAmountRemaining : pOAvailableBalance;

                if((!this.get('purchaseOrder').get('isEnabled') && this.get('purchaseOrder').selected) || order.get('payments').length > 0) {
                    return;
                }


                currentPurchaseOrder.set('amount', amount);
                if(amount < orderAmountRemaining) {
                    currentPurchaseOrder.set('splitPayment', true);
                }

                //refresh ui when split payment is working?
                me.trigger('stepstatuschange'); // trigger a rerender
            },
            isPurchaseOrderEnabled: function() {
                var me = this,
                    order = me.getOrder(),
                    purchaseOrderInfo = order ?  order.get('customer').get('purchaseOrder') : null,
                    purchaseOrderSiteSettings = HyprLiveContext.locals.siteContext.checkoutSettings.purchaseOrder ?
                        HyprLiveContext.locals.siteContext.checkoutSettings.purchaseOrder.isEnabled : false,
                    purchaseOrderCustomerEnabled = purchaseOrderInfo ? purchaseOrderInfo.isEnabled : false,
                    customerAvailableBalance = purchaseOrderCustomerEnabled ? purchaseOrderInfo.totalAvailableBalance > 0 : false,
                    purchaseOrderEnabled = purchaseOrderSiteSettings && purchaseOrderCustomerEnabled && customerAvailableBalance;

                return purchaseOrderEnabled;
            },
            resetPOInfo: function() {
                var me = this,
                    currentPurchaseOrder = me.get('purchaseOrder');

                currentPurchaseOrder.get('paymentTermOptions').reset();
                currentPurchaseOrder.get('customFields').reset();
                currentPurchaseOrder.get('paymentTerm').clear();

                this.setPurchaseOrderInfo();
            },
            setPurchaseOrderInfo: function() {
                var me = this,
                    order = me.getOrder(),
                    purchaseOrderInfo = order ? order.get('customer').get('purchaseOrder') : null,
                    purchaseOrderEnabled = this.isPurchaseOrderEnabled(),
                    currentPurchaseOrder = me.get('purchaseOrder'),
                    siteId = require.mozuData('checkout').siteId,
                    currentPurchaseOrderAmount = currentPurchaseOrder.get('amount');

                currentPurchaseOrder.set('isEnabled', purchaseOrderEnabled);
                if(!purchaseOrderEnabled) {
                    // if purchase order isn't enabled, don't populate stuff!
                    return;
                }

                // Breaks the custom field array into individual items, and makes the value
                //  field a first class item against the purchase order model. Also populates the field if the
                //  custom field has a value.
                currentPurchaseOrder.deflateCustomFields();
                // Update models-checkout validation with flat purchaseOrderCustom fields for validation.
                for(var validateField in currentPurchaseOrder.validation) {
                    if(!this.validation['purchaseOrder.'+validateField]) {
                        this.validation['purchaseOrder.'+validateField] = currentPurchaseOrder.validation[validateField];
                    }
                    // Is this level needed?
                    if(!this.parent.validation['billingInfo.purchaseOrder.'+validateField]) {
                        this.parent.validation['billingInfo.purchaseOrder.'+validateField] =
                            currentPurchaseOrder.validation[validateField];
                    }
                }

                // Set information, only if the current purchase order does not have it:
                var amount = purchaseOrderInfo.totalAvailableBalance > order.get('amountRemainingForPayment') ?
                        order.get('amountRemainingForPayment') : purchaseOrderInfo.totalAvailableBalance;

                currentPurchaseOrder.set('amount', amount);

                currentPurchaseOrder.set('totalAvailableBalance', purchaseOrderInfo.totalAvailableBalance);
                currentPurchaseOrder.set('availableBalance', purchaseOrderInfo.availableBalance);
                currentPurchaseOrder.set('creditLimit', purchaseOrderInfo.creditLimit);

                if(purchaseOrderInfo.totalAvailableBalance < order.get('amountRemainingForPayment')) {
                    currentPurchaseOrder.set('splitPayment', true);
                }

                var paymentTerms = [];
                purchaseOrderInfo.paymentTerms.forEach(function(term) {
                    if(term.siteId === siteId) {
                        var newTerm = {};
                        newTerm.code = term.code;
                        newTerm.description = term.description;
                        paymentTerms.push(term);
                    }
                });
                currentPurchaseOrder.set('paymentTermOptions', paymentTerms, {silent: true});

                var paymentTermOptions = currentPurchaseOrder.get('paymentTermOptions');
                if(paymentTermOptions.length === 1) {
                    var paymentTerm = {};
                    paymentTerm.code = paymentTermOptions.models[0].get('code');
                    paymentTerm.description = paymentTermOptions.models[0].get('description');
                    currentPurchaseOrder.set('paymentTerm', paymentTerm);
                }

                this.setPurchaseOrderBillingInfo();
            },
            setPurchaseOrderBillingInfo: function() {
                var me = this,
                    order = me.getOrder(),
                    purchaseOrderEnabled = this.isPurchaseOrderEnabled(),
                    currentPurchaseOrder = me.get('purchaseOrder'),
                    contacts = order ? order.get('customer').get('contacts') : null;
                if(purchaseOrderEnabled) {
                    if(currentPurchaseOrder.selected && contacts.length > 0) {
                        var foundBillingContact = contacts.models.find(function(item){
                            return item.get('isPrimaryBillingContact');
                        });

                        if(foundBillingContact) {
                            this.set('billingContact', foundBillingContact, {silent: true});
                            currentPurchaseOrder.set('usingBillingContact', true);
                        }
                    }
                }
            },
            setPurchaseOrderPaymentTerm: function(termCode) {
                var currentPurchaseOrder = this.get('purchaseOrder'),
                    paymentTermOptions = currentPurchaseOrder.get('paymentTermOptions');
                    var foundTerm = paymentTermOptions.find(function(term) {
                        return term.get('code') === termCode;
                    });
                    currentPurchaseOrder.set('paymentTerm', foundTerm, {silent: true});
            },
            updateBillingContact : function(contact) {
                if(contact) {
                    this.set('billingContact', contact.toJSON());
                }
            },
            addNewContact: function(){
                this.getOrder().get('dialogContact').resetDestinationContact();
                this.getOrder().get('dialogContact').unset('id');
                this.getOrder().get('dialogContact').get('destinationContact').set('isBillingAddress', true);

                this.getOrder().get('dialogContact').trigger('openDialog');
            },
            selectedBillingDestination : function(){
                var self = this;
                return self.getOrder().get('destinations').hasDestination(this.get('billingContact'));
            },

            initialize: function () {
                var me = this;
                this._cachedGiftCards = [];

                _.defer(function () {
                    //set purchaseOrder defaults here.
                    me.setPurchaseOrderInfo();
                    me.getPaymentTypeFromCurrentPayment();

                    var currentCardId = me.get('card.paymentServiceCardId');
                    var savedCardId = currentCardId ?
                        currentCardId
                        : me.getPrimarySavedCard(me) ? me.getPrimarySavedCard(me).id : undefined;

                    me.set('savedPaymentMethodId', savedCardId, { silent: true });
                    me.setSavedPaymentMethod(savedCardId);

                    if (!currentCardId) {
                        me.setDefaultPaymentType(me);
                    }

                    me.on('change:usingSavedCard', function (me, yes) {
                        if (!yes) {
                            me.get('card').clear();
                            me.set('usingSavedCard', false);
                        }
                        else {
                            me.set('isSameBillingShippingAddress', false);
                            me.setSavedPaymentMethod(me.get('savedPaymentMethodId'));
                        }
                    });
                    me.trigger('updateCheckoutPayment');
                    me.loadGiftCards();
                });
                var billingContact = this.get('billingContact');
                this.on('change:paymentType', this.selectPaymentType);
                this.selectPaymentType(this, this.get('paymentType'));
                this.on('change:isSameBillingShippingAddress', function (model, wellIsIt) {
                    if (wellIsIt) {
                         var destinations = this.selectableDestinations();
                         if(destinations.length) {
                            var oBilling = this.set('billingContact').toJSON();
                            this.set('billingContact', destinations[0].destinationContact, { silent: true });
                            this.set('billingContact.email', oBilling.email, { silent: true });
                         }

                    } else if (billingContact) {
                        // if they initially checked the checkbox, then later they decided to uncheck it... remove the id so that updates don't update
                        // the original address, instead create a new contact address.
                        // We also unset contactId to prevent id from getting reset later.
                        billingContact.unset('id', { silent: true });
                        billingContact.unset('contactId', { silent: true });
                    }

                });
                this.on('change:savedPaymentMethodId', this.syncPaymentMethod);
                this._cachedDigitalCredits = null;

                // This will changed with Gift Card handling phase 2,
                // to emulate the way _cachedDigitalCredits fetches from
                // the customer model later.
                //this.loadGiftCards();
                _.bindAll(this, 'applyPayment', 'markComplete');
            },
            getPrimarySavedCard: function(me){
                return _.find(
                    me.savedPaymentMethods(), function(savedPayment) {
                        return savedPayment.isDefaultPayMethod === true;
                    }
                );
            },
            selectPaymentType: function(me, newPaymentType) {
                if ((!me.changed || !me.changed.paymentWorkflow) && !me.get('paymentWorkflow')) {
                    me.set('paymentWorkflow', 'Mozu');
                }
                me.get('check').selected = newPaymentType === 'Check';
                me.get('card').selected = newPaymentType === 'CreditCard';
                me.get('purchaseOrder').selected = newPaymentType === 'PurchaseOrder';
                if(newPaymentType === 'PurchaseOrder') {
                    me.setPurchaseOrderBillingInfo();
                }
            },
            setDefaultPaymentType: function(me) {
                if(me.isPurchaseOrderEnabled()) {
                    me.set('paymentType', 'PurchaseOrder');
                    me.selectPaymentType(me, 'PurchaseOrder');
                } else if(!me.get('paymentType', 'check')) {
                    me.set('paymentType', 'CreditCard');
                    me.selectPaymentType(me, 'CreditCard');
                    if (me.savedPaymentMethods() && me.savedPaymentMethods().length > 0) {
                        me.set('usingSavedCard', true);
                    }
                }
            },
            isNonMozuCheckout: function() {
                var activePayments = this.getOrder().apiModel.getActivePayments();
                if (activePayments && activePayments.length === 0) return false;
                return (activePayments && (_.findWhere(activePayments, { paymentType: 'PayPalExpress2' }) || _.findWhere(activePayments, {paymentType: 'PayWithAmazon'}) ||  _.findWhere(activePayments, {paymentType: "token"}) ));
            },
            calculateStepStatus: function () {
                var shippingStepComplete = this.parent.get('shippingStep').stepStatus() === 'complete',
                    shippingInfoComplete = this.parent.get('shippingInfo').stepStatus() === 'complete',
                    activePayments = this.activePayments(),
                    thereAreActivePayments = activePayments.length > 0,
                    paymentTypeIsCard = activePayments && !!_.findWhere(activePayments, { paymentType: 'CreditCard' }),
                    billingContactEmail = this.get('billingContact.email'),
                    balanceNotPositive = this.parent.get('amountRemainingForPayment') <= 0;

                if (!shippingStepComplete || !shippingInfoComplete) return this.stepStatus('new');

                if (this.isNonMozuCheckout()) return this.stepStatus("complete");

                if (paymentTypeIsCard && !Hypr.getThemeSetting('isCvvSuppressed')) return this.stepStatus('incomplete'); // initial state for CVV entry

                if(!billingContactEmail) return this.stepStatus("incomplete");


                if (thereAreActivePayments && (balanceNotPositive || (this.get('paymentType') === 'PaypalExpress' && window.location.href.indexOf('PaypalExpress=complete') !== -1))) return this.stepStatus('complete');
                return this.stepStatus('incomplete');

            },
            hasPaymentChanged: function(payment) {

                function getPurchaseOrder(obj) {
                    if(obj.purchaseOrder){
                        if(obj.purchaseOrder.code){
                            return obj.purchaseOrder;
                        }
                    }
                    return {};
                }
                // fix this for purchase orders, currently it constantly voids, then re-applys the payment even if nothing changes.
                function normalizeBillingInfos(obj) {
                    return {
                        paymentType: obj.paymentType,
                        billingContact: _.extend(_.pick(obj.billingContact,
                            'email',
                            'firstName',
                            'lastNameOrSurname',
                            'phoneNumbers'),
                        {
                            address: obj.billingContact.address ? _.pick(obj.billingContact.address,
                                'address1',
                                'address2',
                                'addressType',
                                'cityOrTown',
                                'countryCode',
                                'postalOrZipCode',
                                'stateOrProvince') : {}
                        }),
                        card: obj.card ? _.extend(_.pick(obj.card,
                            'expireMonth',
                            'expireYear',
                            'nameOnCard',
                            'isSavedCardInfo'),
                        {
                            cardType: obj.card.paymentOrCardType || obj.card.cardType,
                            cardNumber: obj.card.cardNumberPartOrMask || obj.card.cardNumberPart || obj.card.cardNumber,
                            id: obj.card.paymentServiceCardId || obj.card.id,
                            isCardInfoSaved: obj.card.isCardInfoSaved || false
                        }) : {},
                        purchaseOrder: getPurchaseOrder(obj),
                        check: obj.check || {}
                    };
                }

                var normalizedSavedPaymentInfo = normalizeBillingInfos(payment.billingInfo);
                var normalizedLiveBillingInfo = normalizeBillingInfos(this.toJSON());

                if (payment.paymentWorkflow === 'VisaCheckout') {
                    normalizedLiveBillingInfo.billingContact.address.addressType = normalizedSavedPaymentInfo.billingContact.address.addressType;
                }

                return !_.isEqual(normalizedSavedPaymentInfo, normalizedLiveBillingInfo);
            },
            submit: function () {

                var order = this.getOrder();
                var self = this;


                // This needs to be ahead of validation so we can check if visa checkout is being used.
                var currentPayment = order.apiModel.getCurrentPayment();

                // the card needs to know if this is a saved card or not.
                this.get('card').set('isSavedCard', order.get('billingInfo.usingSavedCard'));
                // the card needs to know if this is Visa checkout (or Amazon? TBD)
                if (currentPayment) {
                    this.get('card').set('isVisaCheckout', currentPayment.paymentWorkflow.toLowerCase() === 'visacheckout');
                }

                var val = this.validate();

                if (this.nonStoreCreditOrGiftCardTotal() > 0 && val) {
                    // display errors:
                    /*
                    var error = {"items":[]};
                    for (var key in val) {
                        if (val.hasOwnProperty(key)) {
                            var errorItem = {};
                            errorItem.name = key;
                            errorItem.message = key.substring(0, ".") + val[key];
                            error.items.push(errorItem);
                        }
                    }
                    if (error.items.length > 0) {
                        order.onCheckoutError(error);
                    }
                    */
                    return false;
                }

                if(val && val['billingContact.email']) {
                    order.onCheckoutError(val['billingContact.email']);
                }

                //If Single Address Save to Destination
                //Do I need this Line? Why Did I orginally Do this?
                //
                // if(this.selectableDestinations() < 2) {
                //     order.get('destinations').saveShippingDestinationAsync(self.get('billingContact'));
                // }

                var card = this.get('card');
                if(this.get('paymentType').toLowerCase() === "purchaseorder") {
                    this.get('purchaseOrder').inflateCustomFields();
                }

                if (!currentPayment) {
                    return self.applyPayment();
                } else if (this.hasPaymentChanged(currentPayment)) {
                    return order.apiVoidPayment(currentPayment.id).then(self.applyPayment);
                } else if (card.get('cvv') && card.get('paymentServiceCardId')) {
                    return card.apiSave().then(self.markComplete, order.onCheckoutError);
                } else {
                   return this.markComplete();
                }
            },
            applyPayment: function () {

                var self = this, order = this.getOrder();
                this.syncApiModel();
                if (this.nonStoreCreditOrGiftCardTotal() > 0) {
                    return order.apiAddPayment().then(function() {
                        var payment = order.apiModel.getCurrentPayment();
                        var modelCard, modelCvv;
                        var activePayments = order.apiModel.getActivePayments();
                        var creditCardPayment = activePayments && _.findWhere(activePayments, { paymentType: 'CreditCard' });
                        //Clear card if no credit card payments exists
                        if (!creditCardPayment && self.get('card')) {
                            self.get('card').clear();
                        }
                        if (payment) {
                            switch (payment.paymentType) {
                                case 'CreditCard':
                                    //TO-DO
                                    // Somthing is off with the apiSync for AddPayment.
                                    // We Should not have to manually set card info
                                    self.set('card', payment.billingInfo.card);

                                    modelCard = self.get('card');
                                    modelCvv = modelCard.get('cvv');
                                    if (
                                        modelCvv && modelCvv.indexOf('*') === -1 // CVV exists and is not masked
                                    ) {
                                        modelCard.set('cvv', '***');
                                        // to hide CVV once it has been sent to the paymentservice
                                    }

                                    self.markComplete();
                                    break;
                                default:
                                    self.markComplete();
                            }
                        }

                    });
                } else {
                    this.markComplete();
                }

            },

            markComplete: function () {
                var order = this.getOrder();
                var self = this;
                order.apiModel.updateCheckout({
                    email: self.get('billingContact.email'),
                    acceptsMarketing: order.get('acceptsMarketing')
                });
                this.stepStatus('complete');
                this.isLoading(false);
                _.defer(function() {
                    order.isReady(true);
                });
            },
            toJSON: function(options) {
                var j = CheckoutStep.prototype.toJSON.apply(this, arguments), loggedInEmail;
                if (this.nonStoreCreditOrGiftCardTotal() === 0 && j.billingContact) {
                    delete j.billingContact.address;
                }
                if (j.billingContact && !j.billingContact.email) {
                    j.billingContact.email = this.getOrder().get('customer.emailAddress');
                }
                return j;
            }
        });

        return BillingInfo;
    }
);

define('modules/models-dialog',["modules/backbone-mozu", 'hyprlive'], function(Backbone, Hypr) {

    var modalDialog = Backbone.MozuModel.extend({
        
        closeDialog: function(){
            this.trigger('closeDialog');
        },
        openDialog: function(){
            this.trigger('openDialog');
        },
        saveDialog: function(){
            this.trigger('saveDialog');
        }
    });
    return modalDialog;
});

define('modules/checkout/contact-dialog/models-contact-dialog',["backbone", 'hyprlive', 'modules/models-customer', 'modules/models-dialog' ], function(Backbone, Hypr, CustomerModels, Dialog) {
    var customerDialogContact = CustomerModels.Contact.extend({
        requiredBehaviors: []
    });

    var modalDialog = Dialog.extend({
        handlesMessages: true,
        relations : {
            destinationContact: customerDialogContact
        },
        resetDestinationContact: function(){
            
    	   this.get('destinationContact').clear();
           this.set('destinationContact', new CustomerModels.Contact({address: {}}));

        }, 
        initialize: function () {
        	this.set('destinationContact', new CustomerModels.Contact({address: {}}));
        }
    });

    return modalDialog;
});

define('modules/checkout/models-checkout-page',[
    'modules/jquery-mozu',
    'underscore',
    'hyprlive',
    'modules/backbone-mozu',
    'modules/api',
    'modules/models-customer',
    'modules/models-address',
    'modules/models-paymentmethods',
    'hyprlivecontext',
    'modules/models-orders',
    'modules/checkout/steps/models-base-checkout-step',
    'modules/checkout/steps/step1/models-step-shipping-info',
    'modules/checkout/models-shipping-destinations',
    'modules/checkout/steps/step2/models-step-shipping-methods',
    'modules/checkout/steps/step3/models-payment',
    'modules/checkout/contact-dialog/models-contact-dialog'
],
    function ($, _, Hypr, Backbone, api, CustomerModels, AddressModels, PaymentMethods,
        HyprLiveContext, OrderModels, CheckoutStep, ShippingStep,
        ShippingDestinationModels, ShippingInfo, BillingInfo, ContactDialogModels) {

    var checkoutPageValidation = {
            'emailAddress': {
                fn: function (value) {
                    if (this.attributes.createAccount && (!value || !value.match(Backbone.Validation.patterns.email))) return Hypr.getLabel('emailMissing');
                }
            },
            'password': {
                fn: function (value) {
                    if (this.attributes.createAccount && !value) return Hypr.getLabel('passwordMissing');
                }
            },
            'confirmPassword': {
                fn: function (value) {
                    if (this.attributes.createAccount && value !== this.get('password')) return Hypr.getLabel('passwordsDoNotMatch');
                }
            }
        };

        if (Hypr.getThemeSetting('requireCheckoutAgreeToTerms')) {
            checkoutPageValidation.agreeToTerms = {
                acceptance: true,
                msg: Hypr.getLabel('didNotAgreeToTerms')
            };
        }

        var storefrontOrderAttributes = require.mozuData('pagecontext').storefrontOrderAttributes;
        if(storefrontOrderAttributes && storefrontOrderAttributes.length > 0){

            var requiredAttributes = _.filter(storefrontOrderAttributes,
                function(attr) { return attr.isRequired && attr.isVisible && attr.valueType !== 'AdminEntered' ;  });
            requiredAttributes.forEach(function(attr) {
                if(attr.isRequired) {

                    checkoutPageValidation['orderAttribute-' + attr.attributeFQN] =
                    {
                        required: true,
                        msg: attr.content.value + " " + Hypr.getLabel('missing')
                    };
                }
            }, this);
        }



var CheckoutOrder = OrderModels.Order.extend({
    helpers : ['selectableDestinations', 'isOriginalCartItem'],
    validation : {
        destinationId : {
            required: true,
            msg: Hypr.getLabel("shippingDestinationRequiredError")
        }
    },
    initialize: function(){

    },
    getCheckout : function(){
        return this.collection.parent;
    },
    getDestinations : function(){
        return this.getCheckout().get('destinations');
    },
    selectableDestinations : function(){
        var selectable = [];
         var shippingDestinations = this.getCheckout().selectableDestinations("Shipping");
         shippingDestinations.forEach(function(destination){
            if(!destination.isSingleShipDestination){
                selectable.push(destination);
            }
        });
        return selectable;
    },
    isOriginalCartItem : function(){
        var self = this;
        var originalCartItem = self.collection.findWhere({originalCartItemId: self.get('originalCartItemId')});
        return originalCartItem.id == self.get('id');
    },
    addNewContact: function(){
        var self = this;
        this.getCheckout().get('dialogContact').resetDestinationContact();
        this.getCheckout().get('dialogContact').unset('id');

        this.getCheckout().get('dialogContact').trigger('openDialog');

        this.listenToOnce(this.getCheckout().get('dialogContact'), 'dialogClose', function () {
            self.set('editingDestination', false);
        });
    },
    editContact: function(destinationId){
        var destination = this.getDestinations().findWhere({'id': destinationId});

        if(destination){
            var destCopy = destination.toJSON();
            destCopy = new ShippingDestinationModels.ShippingDestination(destCopy);
            //destCopy.set('destinationContact', new CustomerModels.Contact(destCopy.get('destinationContact')));
            //this.getCheckout().get('dialogContact').get("destinationContact").clear();
            this.getCheckout().set('dialogContact', destCopy);
            this.getCheckout().get('dialogContact').set("destinationContact", new CustomerModels.Contact(destCopy.get('destinationContact').toJSON()));
            this.getCheckout().get('dialogContact').trigger('openDialog');
        }

    },
    updateOrderItemDestination: function(destinationId, customerContactId){
        var self = this;
        self.isLoading(true);

        if(!destinationId) {
            var destination = self.getCheckout().get('destinations').findWhere({customerContactId: customerContactId});
            if(destination){
                return destination.saveDestinationAsync().then(function(data){
                    return self.getCheckout().apiUpdateCheckoutItemDestination({
                        id: self.getCheckout().get('id'),
                        itemId: self.get('id'),
                        destinationId: data.data.id
                    }).ensure(function(){
                        self.isLoading(false);
                    });
                });
            }
        }
        self.set('destinationId', destinationId);
        return self.getCheckout().apiUpdateCheckoutItemDestination({
            id: self.getCheckout().get('id'),
            itemId: self.get('id'),
            destinationId: destinationId
        }).ensure(function(){
            self.isLoading(false);
        });
    },
    splitCheckoutItem : function(){
        var self = this;
        var me = this;
        this.getCheckout().get('shippingStep').splitCheckoutItem(self.get('id'), 1);
    }
});


var CheckoutGrouping = Backbone.MozuModel.extend({
    helpers: ['groupingItemInfo', 'groupingDestinationInfo', 'groupingShippingMethods', 'loadingShippingMethods'],
    validation : {
        shippingMethodCode : {
            fn: "validateShippingCode",
            msg: Hypr.getLabel("shippingMethodRequiredError")
        }
    },
    validateShippingCode: function(value, attr) {
        if (!this.get('shippingMethodCode') && this.get('fulfillmentMethod') == "Ship") return this.validation[attr.split('.').pop()].msg;
    },
    getCheckout : function(){
        return this.collection.parent;
    },
    groupingItemInfo : function(){
        var self = this,
            orderItems = [];

        _.forEach(this.get('orderItemIds'), function(itemId, idx){
            var item = self.getCheckout().get('items').findWhere({id: itemId});
            if(item) orderItems.push(item.toJSON());
        });

        return orderItems;
    },
    groupingDestinationInfo : function(){
       var self = this,
       destinationInfo = self.getCheckout().get('destinations').findWhere({id:this.get('destinationId')});
       return (destinationInfo) ? destinationInfo.toJSON() : {};
    },
    groupingShippingMethods : function(){
        var self = this,
        shippingMethod = self.getCheckout().get('shippingMethods').findWhere({groupingId:this.get('id')});
        return (shippingMethod) ? shippingMethod.toJSON().shippingRates : [];
    },
    loadingShippingMethods : function(){
        this.getCheckout().get('shippingMethods').get('isLoading');
    }
});

var CheckoutPage = Backbone.MozuModel.extend({
            mozuType: 'checkout',
            handlesMessages: true,
            relations: {
                items : Backbone.Collection.extend({
                    model : CheckoutOrder
                }),
                groupings : Backbone.Collection.extend({
                    model : CheckoutGrouping
                }),
                billingInfo: BillingInfo,
                shopperNotes: Backbone.MozuModel.extend(),
                customer: CustomerModels.Customer,
                destinations : ShippingDestinationModels.ShippingDestinations,
                shippingStep: ShippingStep,
                shippingInfo: ShippingInfo,
                dialogContact: ContactDialogModels,
                shippingMethods : Backbone.Collection.extend()
            },
            validation: checkoutPageValidation,
            dataTypes: {
                createAccount: Backbone.MozuModel.DataTypes.Boolean,
                acceptsMarketing: Backbone.MozuModel.DataTypes.Boolean,
                amountRemainingForPayment: Backbone.MozuModel.DataTypes.Float,
                isMultiShipMode : Backbone.MozuModel.DataTypes.Boolean
            },
            defaults: {
                "isMultiShipMode" : false
            },
            requiredBehaviors: [1002],
            setMultiShipMode : function(){
            var directShipItems = this.get('items').where({fulfillmentMethod: "Ship"});
            var destinationCount = [];
             _.each(directShipItems, function(item){
                var id = item.get('destinationId') ? item.get('destinationId') : 0;
                if(destinationCount.indexOf(id) === -1) {
                    destinationCount.push(id);
                }
             });

            return (destinationCount.length > 1) ? this.set('isMultiShipMode', true) : this.set('isMultiShipMode', false);
            },
            addCustomerContacts : function(){
                var self =this;
                var contacts = self.get('customer').get('contacts');

                if(contacts.length){
                    contacts.each(function(contact, key){

                        if(!self.get('destinations').hasDestination(contact)){
                            if(contact.contactTypeHelpers().isShipping() && contact.contactTypeHelpers().isBilling()){
                                self.get('destinations').newDestination(contact, true, "ShippingAndBilling");
                            } else if (contact.contactTypeHelpers().isShipping()) {
                                self.get('destinations').newDestination(contact, true, "Shipping");
                            } else if (contact.contactTypeHelpers().isBilling()) {
                                self.get('destinations').newDestination(contact, true, "Billing");
                            }
                        }

                    });
                    self.get('destinations').trigger('destinationsUpdate');
                }
            },
            checkBOGA: function(){
              var me = this;
              var suggestedDiscounts = me.get('suggestedDiscounts') || [];
              var autoAddSuggestedDiscount = suggestedDiscounts.some(function(discount){
                return discount.autoAdd;
              });
              if (suggestedDiscounts.length && autoAddSuggestedDiscount){
                window.location = (HyprLiveContext.locals.siteContext.siteSubdirectory||'') + "/cart";
              }
            },
            initialize: function (data) {

                var self = this,
                    user = require.mozuData('user');
                    //self.get('shippingStep').initSet();

                this.on('sync', function(rawJSON) {
                    self.addCustomerContacts();
                    self.checkBOGA();
                });

                self.addCustomerContacts();
                self.checkBOGA();

                _.defer(function() {
                    self.setMultiShipMode();


                    var latestPayment = self.apiModel.getCurrentPayment(),
                        activePayments = self.apiModel.getActivePayments(),
                        //fulfillmentInfo = self.get('fulfillmentInfo'),
                        shippingStep = self.get('shippingStep'),
                        shippingInfo = self.get('shippingInfo'),
                        billingInfo = self.get('billingInfo'),
                        steps = [shippingStep, shippingInfo, billingInfo],
                        paymentWorkflow = latestPayment && latestPayment.paymentWorkflow,
                        visaCheckoutPayment = activePayments && _.findWhere(activePayments, { paymentWorkflow: 'VisaCheckout' }),
                        allStepsComplete = function () {
                            return _.reduce(steps, function(m, i) { return m + i.stepStatus(); }, '') === 'completecompletecomplete';
                        },
                        isReady = allStepsComplete();

                    //Visa checkout payments can be added to order without UIs knowledge. This evaluates and voids the required payments.
                    if (visaCheckoutPayment) {
                        _.each(_.filter(self.apiModel.getActivePayments(), function (payment) {
                            return payment.paymentType !== 'StoreCredit' && payment.paymentType !== 'GiftCard' && payment.paymentWorkflow != 'VisaCheckout';
                        }), function (payment) {
                            self.apiVoidPayment(payment.id);
                        });
                        paymentWorkflow = visaCheckoutPayment.paymentWorkflow;
                        billingInfo.unset('billingContact');
                        billingInfo.set('card', visaCheckoutPayment.billingInfo.card);
                        billingInfo.set('billingContact', visaCheckoutPayment.billingInfo.billingContact, { silent:true });
                     }

                    if (paymentWorkflow) {
                        billingInfo.set('paymentWorkflow', paymentWorkflow);
                        billingInfo.get('card').set({
                            isCvvOptional: Hypr.getThemeSetting('isCvvSuppressed'),
                            paymentWorkflow: paymentWorkflow
                        });
                        billingInfo.trigger('stepstatuschange'); // trigger a rerender
                    }

                    self.isReady(isReady);

                    _.each(steps, function(step) {
                        self.listenTo(step, 'stepstatuschange', function() {
                            _.defer(function() {
                                self.isReady(allStepsComplete());
                            });
                        });
                    });

                    if (!self.get('requiresFulfillmentInfo')) {
                        self.validation = _.pick(self.constructor.prototype.validation, _.filter(_.keys(self.constructor.prototype.validation), function(k) { return k.indexOf('fulfillment') === -1; }));
                    }



                    var billingEmail = billingInfo.get('billingContact.email');
                    if (!billingEmail && user.email) billingInfo.set('billingContact.email', user.email);

                    self.applyAttributes();

                });
                if (user.isAuthenticated) {
                    this.set('customer', { id: user.accountId });
                }
                // preloaded JSON has this as null if it's unset, which defeats the defaults collection in backbone
                if (!data.acceptsMarketing) {
                    self.set('acceptsMarketing', true);
                }

                _.bindAll(this, 'update', 'onCheckoutSuccess', 'onCheckoutError', 'addNewCustomer', 'saveCustomerCard', 'apiCheckout',
                    'addDigitalCreditToCustomerAccount', 'saveCustomerContacts');

            },
            getCustomerInfo : function(){
                return this.get('customer');
            },
            getCheckout : function(){
                return this;
            },
            selectableDestinations : function(customerContactType){
               var selectable = [];
               this.getCheckout().get('destinations').each(function(destination){
                    if(!destination.get('isGiftCardDestination')){
                       if(customerContactType && destination.get('customerContactType')) {
                            if(destination.get('customerContactType') === customerContactType || destination.get('customerContactType') === "ShippingAndBilling"){
                                selectable.push(destination.toJSON());
                            }
                        } else {
                            selectable.push(destination.toJSON());
                        }
                    }
                });
                return selectable;
            },
            applyAttributes: function() {
                var storefrontOrderAttributes = require.mozuData('pagecontext').storefrontOrderAttributes;
                if(storefrontOrderAttributes && storefrontOrderAttributes.length > 0) {
                    this.set('orderAttributes', storefrontOrderAttributes);
                }
            },

            processDigitalWallet: function(digitalWalletType, payment) {
                var me = this;
                me.runForAllSteps(function() {
                    this.isLoading(true);
                });
                me.trigger('beforerefresh');
                // void active payments; if there are none then the promise will resolve immediately
                return api.all.apply(api, _.map(_.filter(me.apiModel.getActivePayments(), function(payment) {
                    return payment.paymentType !== 'StoreCredit' && payment.paymentType !== 'GiftCard';
                }), function(payment) {
                    return me.apiVoidPayment(payment.id);
                })).then(function() {
                    return me.apiProcessDigitalWallet({
                        digitalWalletData: JSON.stringify(payment)
                    }).then(function () {
                        me.updateVisaCheckoutBillingInfo();
                        me.runForAllSteps(function() {
                            this.trigger('sync');
                            this.isLoading(false);
                        });
                        me.updateShippingInfo();
                    });
                });
            },
            updateShippingInfo: function() {
                var me = this;
                this.get('shippingInfo').updateShippingMethods();
            },
            updateVisaCheckoutBillingInfo: function() {
                //Update the billing info with visa checkout payment
                var billingInfo = this.get('billingInfo');
                var activePayments = this.apiModel.getActivePayments();
                var visaCheckoutPayment = activePayments && _.findWhere(activePayments, { paymentWorkflow: 'VisaCheckout' });
                if (visaCheckoutPayment) {
                    billingInfo.set('usingSavedCard', false);
                    billingInfo.unset('savedPaymentMethodId');
                    billingInfo.set('card', visaCheckoutPayment.billingInfo.card);
                    billingInfo.unset('billingContact');
                    billingInfo.set('billingContact', visaCheckoutPayment.billingInfo.billingContact, { silent:true });
                    billingInfo.set('paymentWorkflow', visaCheckoutPayment.paymentWorkflow);
                    billingInfo.set('paymentType', visaCheckoutPayment.paymentType);
                    this.refresh();
                }
            },
            addCoupon: function () {
                var me = this;
                var code = this.get('couponCode');
                var orderDiscounts = me.get('orderDiscounts');
                if (orderDiscounts && _.findWhere(orderDiscounts, { couponCode: code })) {
                    // to maintain promise api
                    var deferred = api.defer();
                    deferred.reject();
                    deferred.promise.otherwise(function () {
                        me.trigger('error', {
                            message: Hypr.getLabel('promoCodeAlreadyUsed', code)
                        });
                    });
                    return deferred.promise;
                }
                this.isLoading(true);
                return this.apiAddCoupon(this.get('couponCode')).then(function (response) {

                    me.get('billingInfo').trigger('sync');
                    me.set('couponCode', '');
                    var groupingShippingDiscounts = [];
                    me.get("groupings").forEach(function(grouping){
                      grouping.get('shippingDiscounts').forEach(function(discount){
                        groupingShippingDiscounts.push(discount);
                      });
                    });

                    /* BOGA cart redirect check -
                      We run checkBOGA on every model sync. That means, if a
                      BOGA coupon was applied, it's already been run and at this
                      point we're just about to get kicked back to the cart.
                      We don't want this validation to flash an error message
                      before the redirect is complete, so we take the suggestedDiscounts
                      into account when deciding whether to show that message.
                    */
                    var redirectToCart = false;
                    var suggestedDiscounts = me.get('suggestedDiscounts') || [];
                    var autoAddSuggestedDiscount = suggestedDiscounts.some(function(discount){
                      return discount.autoAdd;
                    });
                    if (suggestedDiscounts.length && autoAddSuggestedDiscount){
                      redirectToCart = true;
                    }

                    var productDiscounts = _.flatten(me.get('items').pluck('productDiscounts'));
                    var shippingDiscounts = _.flatten(_.pluck(_.flatten(me.get('items').pluck('shippingDiscounts')), 'discount'));
                    var orderShippingDiscounts = _.flatten(_.pluck(groupingShippingDiscounts, 'discount'));

                    var allDiscounts = me.get('orderDiscounts').concat(productDiscounts).concat(shippingDiscounts).concat(orderShippingDiscounts);
                    var lowerCode = code.toLowerCase();

                    var matchesCode = function (d) {
                        // there are discounts that have no coupon code that we should not blow up on.
                        return (d.couponCode || "").toLowerCase() === lowerCode;
                    };

                    var invalidCoupons = _.pluck(response.invalidCoupons, "couponCode");



                    if (_.contains(invalidCoupons, code)){
                      me.trigger('error', {
                        message: Hypr.getLabel('promoCodeInvalid', code)
                      });

                  } else if (!redirectToCart && (!allDiscounts || !_.find(allDiscounts, matchesCode)))
                    {
                        me.trigger('error', {
                            message: Hypr.getLabel('promoCodeError', code)
                        });

                    } else if (me.get('total') === 0) {

                        me.trigger('complete');
                    }
                    // only do this when there isn't a payment on the order...
                    me.get('billingInfo').updatePurchaseOrderAmount();
                    me.isLoading(false);

                });
            },
            onCheckoutSuccess: function () {
                this.isLoading(true);
                this.trigger('complete');
            },
            onCheckoutError: function (error) {
                var order = this,
                    errorHandled = false;
                order.isLoading(false);
                if (!error || !error.items || error.items.length === 0) {
                    var has10486Error = _.find(error.additionalErrorData, function(additionalData) { return additionalData.value.indexOf('10486') != -1;});
                    if (has10486Error){
                        var siteContext = HyprLiveContext.locals.siteContext,
                            externalPayment = _.findWhere(siteContext.checkoutSettings.externalPaymentWorkflowSettings, {"name" : "PayPalExpress2"}),
                            environment = _.findWhere(externalPayment.credentials, {"apiName" : "environment"}),
                            url = "";

                        if (environment.value.toLowerCase() === "sandbox"){
                            url = "https://www.sandbox.paypal.com";
                        }
                        else{
                            url = "https://www.paypal.com";
                        }

                        var paypalPayments = _.filter(order.get("payments"),function(payment) { return payment.paymentType == "PayPalExpress2";});
                        paypalPayments = _.sortBy(paypalPayments, function(payment) {return payment.auditInfo.updateDate;}).reverse();

                        window.location.href = url + "/cgi-bin/webscr?cmd=_express-checkout&token=" + paypalPayments[0].externalTransactionId;

                        return;
                    } else {
                        error = {
                            items: [
                                {
                                    message: error.message || Hypr.getLabel('unknownError')
                                }
                            ]
                        };
                    }
                }
                $.each(error.items, function (ix, errorItem) {
                    if (errorItem.name === 'ADD_CUSTOMER_FAILED' && errorItem.message.toLowerCase().indexOf('invalid parameter: password')) {
                        errorHandled = true;
                        order.trigger('passwordinvalid', errorItem.message.substring(errorItem.message.indexOf('Password')));
                    }
                    if (errorItem.errorCode === 'ADD_CUSTOMER_FAILED' && errorItem.message.toLowerCase().indexOf('invalid parameter: emailaddress')) {
                        errorHandled = true;
                        order.trigger('userexists', order.get('emailAddress'));
                    }
                });

                this.trigger('error', error);

                if (!errorHandled) order.messages.reset(error.items);
                order.isSubmitting = false;
                throw error;
            },
            addNewCustomer: function () {
                var self = this,
                billingInfo = this.get('billingInfo'),
                billingContact = billingInfo.get('billingContact'),
                email = this.get('emailAddress'),
                captureCustomer = function (customer) {
                    if (!customer || (customer.type !== 'customer' && customer.type !== 'login')) return;
                    var newCustomer;
                    if (customer.type === 'customer') newCustomer = customer.data;
                    if (customer.type === 'login') newCustomer = customer.data.customerAccount;
                    if (newCustomer && newCustomer.id) {
                        self.set('customer', newCustomer);
                        api.off('sync', captureCustomer);
                        api.off('spawn', captureCustomer);
                    }
                };
                api.on('sync', captureCustomer);
                api.on('spawn', captureCustomer);
                return this.apiAddNewCustomer({
                    account: {
                        emailAddress: email,
                        userName: email,
                        firstName: billingContact.get('firstName') || this.get('fulfillmentInfo.fulfillmentContact.firstName'),
                        lastName: billingContact.get('lastNameOrSurname') || this.get('fulfillmentInfo.fulfillmentContact.lastNameOrSurname'),
                        acceptsMarketing: self.get('acceptsMarketing')
                    },
                    password: this.get('password')
                }).then(function (customer) {
                    self.customerCreated = true;
                    return customer;
                }, function (error) {
                    self.customerCreated = false;
                    self.isSubmitting = false;
                    throw error;
                });
            },
            addApiCustomerContacts: function () {
                var self = this;
                var destinations = self.get('destinations');
                if(self.get('destinations').length) {
                    //Save some Contacts

                }
            },
            isEmptyAddress: function(obj){
                var emptyAddress = new AddressModels.StreetAddress({}).toJSON();
                var areEqual = _.isMatch(emptyAddress, {
                    addressType: obj.addressType,
                    candidateValidatedAddresses: obj.candidateValidatedAddresses,
                    countryCode: obj.countryCode,
                    postalOrZipCode: obj.postalOrZipCode,
                    stateOrProvince: obj.stateOrProvince
                });
                return areEqual;
            },
            compareAddressObjects: function(obj1, obj2) {
                var areEqual = _.isMatch(obj1, {
                    address1 : obj2.address1,
                    addressType : obj2.addressType,
                    cityOrTown : obj2.cityOrTown,
                    countryCode : obj2.countryCode,
                    postalOrZipCode : obj2.postalOrZipCode,
                    stateOrProvince : obj2.stateOrProvince
                });
                return areEqual;
            },
            getContactIndex: function(contacts, contact) {
                var self = this;
                return _.findIndex(contacts, function(existingContact) {
                        return self.compareAddressObjects(existingContact.address, contact.address);
                    });
            },
            mergeContactTypes: function(originalContactTypes, newContactTypes) {
                    var mergedTypes = originalContactTypes || [];
                    var originalContactsTypesIndex = _.findIndex(originalContactTypes, function(type) {
                        return type.name === "Billing";
                    });

                    var newContactTypesIndex = _.findIndex(newContactTypes, function(type) {
                        return type.name === "Billing";
                    });

                    if (newContactTypes) {
                        if (originalContactsTypesIndex > -1) {
                            mergedTypes[originalContactsTypesIndex] = newContactTypes[newContactTypesIndex];
                        }
                        else {
                            mergedTypes.push(newContactTypes[newContactTypesIndex]);
                        }
                    }

                    return mergedTypes;
            },
            saveCustomerContacts: function() {
                var customer = this.get('customer');
                var destinations = this.get('destinations');
                var existingContacts = customer.get('contacts').toJSON() || [];
                var updatedContacts = [];
                var self = this;

                destinations.each(function(destination) {
                    if (!destination.get("isGiftCardDestination")) {
                        var destinationContact = destination.get('destinationContact').toJSON();
                        var existingContactIndex = existingContacts.length > 0 ?
                            self.getContactIndex(existingContacts, destinationContact)
                            : -1;

                        if (existingContactIndex && existingContactIndex === -1) {
                            delete destinationContact.id;
                            destinationContact.types =  [{
                                "name": "Shipping",
                                "isPrimary": (destination.get('destinationContact').contactTypeHelpers().isPrimaryShipping()) ? true : false
                            }];
                            if (!self.isEmptyAddress(destinationContact.address))
                                updatedContacts.push(destinationContact);
                        }
                    }
                });

                // TO-DO :REMOVE
                // This no good and down right bad...
                // var isSavingNewCustomer = this.isSavingNewCustomer();
                // if(isSavingNewCustomer){
                //     if(updatedContacts.length) {
                //         updatedContacts.push(updatedContacts[0].types[{
                //         "name": "Shipping",
                //         "isPrimary": false
                //     }])
                //     }
                // }

                var billingContact = this.get('billingInfo').get('billingContact').toJSON();
                delete billingContact.email;
                billingContact.types =  [{
                        "name": "Billing",
                        "isPrimary": true
                    }];

                var existingBillingContactIndex = existingContacts.length > 0 ?
                    self.getContactIndex(existingContacts, billingContact)
                    : -1;
                var updatedContactIndex = updatedContacts.length > 0 ?
                    self.getContactIndex(updatedContacts, billingContact)
                    : -1;

                if (updatedContactIndex > -1) {
                    updatedContacts[updatedContactIndex].types = self.mergeContactTypes(updatedContacts[updatedContactIndex].types, billingContact.types);
                }
                else if (existingBillingContactIndex > -1) {
                    var newBillingContact = existingContacts[existingBillingContactIndex];
                    newBillingContact.types = self.mergeContactTypes(existingContacts[existingBillingContactIndex].types, billingContact.types);
                    updatedContacts.push(newBillingContact);
                }
                else {
                    if (!self.isEmptyAddress(billingContact.address))
                        updatedContacts.push(billingContact);
                }

                if (updatedContacts.length) {
                    return customer.apiModel.updateCustomerContacts({id: customer.id, postdata:updatedContacts}).then(function(contactResult) {
                        _.each(contactResult.data.items, function(contact) {
                            if(contact.types){
                                var found = _.findWhere(contact.types, {name: "Billing", isPrimary: true});
                                if(found) {
                                    self.get('billingInfo').set('billingContact', contact);
                                return false;
                                }
                            }
                        });
                        return contactResult;
                    });
                }
                return {};
            },
            saveCustomerCard: function () {
                var order = this,
                customer = this.get('customer'), //new CustomerModels.EditableCustomer(this.get('customer').toJSON()),
                billingInfo = this.get('billingInfo'),
                isSameBillingShippingAddress = billingInfo.get('isSameBillingShippingAddress'),
                isPrimaryAddress = this.isSavingNewCustomer(),
                billingContact = billingInfo.get('billingContact').toJSON(),
                card = billingInfo.get('card'),

                doSaveCard = function() {
                    order.cardsSaved = order.cardsSaved || customer.get('cards').reduce(function(saved, card) {
                        saved[card.id] = true;
                        return saved;
                    }, {});
                    var method = order.cardsSaved[card.get('id') || card.get('paymentServiceCardId')] ? 'updateCard' : 'addCard';
                    card.set('contactId', billingContact.id);
                    card.set('isDefaultPayMethod', true);
                    return customer.apiModel[method](card.toJSON()).then(function(card) {
                        order.cardsSaved[card.data.id] = true;
                        return card;
                    });
                };

                if (billingContact.id) {
                    return doSaveCard();
                }
            },
            getBillingContact: function () {
                return;
            },
            ensureEmailIsSet: function () {
                var self = this;
                var billingEmail = this.get('billingInfo.billingContact.email'),
                    customerEmail = require.mozuData('user').email,
                    orderEmail = this.get('email');

                if (orderEmail) {
                    this.set('billingInfo.billingContact.email', orderEmail);
                } else if (billingEmail) {
                    this.set('email', billingEmail);
                } else if (customerEmail) {
                    this.set('billingInfo.billingContact.email', customerEmail);
                    this.set('email', customerEmail);
                }
            },
            setNewCustomerEmailAddress : function(){
                var self = this;

                if(!self.get('emailAddress')){
                    self.set('emailAddress', this.get('billingInfo.billingContact.email'));
                }

            },
            addDigitalCreditToCustomerAccount: function () {
                var billingInfo = this.get('billingInfo'),
                    customer = this.get('customer');

                var digitalCredits = billingInfo.getDigitalCreditsToAddToCustomerAccount();
                if (!digitalCredits)
                    return;
                return _.each(digitalCredits, function (cred) {
                    return customer.apiAddStoreCredit(cred.get('code'));
                });
            },
            isSavingNewCustomer: function() {
                return this.get('createAccount') && !this.customerCreated;
            },

            validateReviewCheckoutFields: function(){
                var validationResults = [];
                var isValid = true;
                for (var field in checkoutPageValidation) {
                    if(checkoutPageValidation.hasOwnProperty(field)) {
                        var result = this.preValidate(field, this.get(field));
                        if(result) {
                            this.trigger('error', {
                                message: result
                            });
                            isValid = false;
                            return false;
                        }
                    }
                }

                return isValid;
            },

            submit: function () {
                var checkout = this,
                    billingInfo = this.get('billingInfo'),
                    billingContact = billingInfo.get('billingContact'),
                    isSameBillingShippingAddress = billingInfo.get('isSameBillingShippingAddress'),
                    isSavingCreditCard = false,
                    isSavingNewCustomer = this.isSavingNewCustomer(),
                    isAuthenticated = require.mozuData('user').isAuthenticated,
                    nonStoreCreditOrGiftCardTotal = billingInfo.nonStoreCreditOrGiftCardTotal(),
                    requiresFulfillmentInfo = this.get('requiresFulfillmentInfo'),
                    requiresBillingInfo = nonStoreCreditOrGiftCardTotal > 0,
                    process = [function() {
                        return checkout.apiUpdateCheckout({
                            ipAddress: checkout.get('ipAddress'),
                            shopperNotes: checkout.get('shopperNotes').toJSON(),
                            email: checkout.get('email')
                        });
                    }];

                var storefrontOrderAttributes = require.mozuData('pagecontext').storefrontOrderAttributes;
                if(storefrontOrderAttributes && storefrontOrderAttributes.length > 0) {
                    var updateAttrs = [];
                    storefrontOrderAttributes.forEach(function(attr){
                        var attrVal = checkout.get('orderAttribute-' + attr.attributeFQN);
                        if(attrVal) {
                            updateAttrs.push({
                                'fullyQualifiedName': attr.attributeFQN,
                                'values': [ attrVal ]
                            });
                        }
                    });

                    if(updateAttrs.length > 0){
                        process.push(function(){
                            return checkout.apiUpdateAttributes(updateAttrs);
                        }, function() {
                            return checkout.apiGet();
                        });
                    }
                }

                if (this.isSubmitting) return;

                this.isSubmitting = true;

                if (requiresBillingInfo && !billingContact.isValid()) {
                    // reconcile the empty address after we got back from paypal and possibly other situations.
                    // also happens with visacheckout ..
                    var billingInfoFromPayment = (this.apiModel.getCurrentPayment() || {}).billingInfo;
                    billingInfo.set(billingInfoFromPayment, { silent: true });
                }

                this.ensureEmailIsSet();
                this.setNewCustomerEmailAddress();

                // skip payment validation, if there are no payments, but run the attributes and accept terms validation.
                if (!this.validateReviewCheckoutFields()) {
                    this.isSubmitting = false;
                    return false;
                }



                this.isLoading(true);

                if (isSavingNewCustomer) {
                    process.unshift(this.addNewCustomer);
                }

                //save contacts
                if ((isAuthenticated || isSavingNewCustomer) && this.hasRequiredBehavior(1014)) {
                    process.push(this.saveCustomerContacts);
                }

                var activePayments = this.apiModel.getActivePayments();
                var saveCreditCard = false;

                if (activePayments !== null && activePayments.length > 0) {
                     var creditCard = _.findWhere(activePayments, { paymentType: 'CreditCard' });
                     if (creditCard && creditCard.billingInfo && creditCard.billingInfo.card) {
                         saveCreditCard = creditCard.billingInfo.card.isCardInfoSaved;
                         billingInfo.set('card', creditCard.billingInfo.card);
                     }
                 }

                if (saveCreditCard && (this.get('createAccount') || isAuthenticated) && this.hasRequiredBehavior(1014)) {
                    isSavingCreditCard = true;
                    process.push(this.saveCustomerCard);
                }

                if ((this.get('createAccount') || isAuthenticated) && billingInfo.getDigitalCreditsToAddToCustomerAccount().length > 0) {
                    process.push(this.addDigitalCreditToCustomerAccount);
                }

                process.push(/*this.finalPaymentReconcile, */this.apiCheckout);

                api.steps(process).then(this.onCheckoutSuccess, this.onCheckoutError);

            },
            update: function() {
                var j = this.toJSON();
                return this.apiModel.update(j);
            },
            refresh: function() {
              var me = this;
              this.trigger('beforerefresh');
              return this.apiGet().then(function() {
                me.trigger('refresh');
                // me.runForAllSteps(function() {
                //   this.trigger("sync");
                // });
              });
            },
            runForAllSteps: function(cb) {
                var me = this;
                _.each([
                       'shippingStep',
                       'shippingInfo',
                       'billingInfo'
                ], function(name) {
                    cb.call(me.get(name));
                });
            },
            isReady: function (val) {
                this.set('isReady', val);
            },
            toJSON: function (options) {
                var j = Backbone.MozuModel.prototype.toJSON.apply(this, arguments);
                if (!options || !options.helpers) {
                    delete j.password;
                    delete j.confirmPassword;
                }
                return j;
            }
        });
    return CheckoutPage;
});

define('modules/eventbus',["underscore", "backbone"], function(_, Backbone){
	return _.extend({}, Backbone.Events); 
});
define('modules/amazonpay',['modules/jquery-mozu','modules/eventbus',"modules/api",'hyprlivecontext','underscore'],
function($,EventBus, Api, hyprlivecontext, _) {
	var AmazonPay = {
		sellerId : "",
		clientId : "",
		buttonColor: "",
		buttonType: "",
		usePopUp: true,
		isEnabled: false,
		isScriptLoaded: false,
		viewName:"amazon-checkout",
		init:function(loadScript) {
			var paymentSettings = _.findWhere(hyprlivecontext.locals.siteContext.checkoutSettings.externalPaymentWorkflowSettings, {"name" : "PAYWITHAMAZON"}) ||
								_.findWhere(hyprlivecontext.locals.siteContext.checkoutSettings.externalPaymentWorkflowSettings, {"name" : "PayWithAmazon"});
			if (!paymentSettings || !paymentSettings.isEnabled) return;
			this.isEnabled = paymentSettings.isEnabled;
			var environment = this.getValue(paymentSettings, "environment");
			var isSandbox = environment == "sandbox";
			var region = this.getValue(paymentSettings, "awsRegion") || this.getValue(paymentSettings, "region");
			this.sellerId = this.getValue(paymentSettings, "sellerId");
			this.clientId = this.getValue(paymentSettings, "clientId");
			this.buttonColor = "Gold";
			this.buttonType = "PwA";
			this.usePopUp = "true";
			var regionMappings = {"de" : "eu", "uk" : "eu", "us" : "na", "jp" : "jp"};

			if (this.sellerId && this.clientId && loadScript) {
				var self = this;
				window.sandbox = (isSandbox ? "/sandbox" : "");

				if (region != "us")
					window.sandbox += "/lpa";

				var payWithAmazonUrl = "https://static-"+regionMappings[region]+".payments-amazon.com/OffAmazonPayments/"+ region + window.sandbox + "/js/Widgets.js";

				window.onAmazonLoginReady = function() {
					window.amazon.Login.setClientId(self.clientId); //use clientId
				};
			
				$.getScript(payWithAmazonUrl).done(function(scrit, textStatus){
					//window.console.log(textStatus);
					self.isScriptLoaded = true;
					EventBus.trigger("aws-script-loaded");
				}).fail(function(jqxhr, settings, exception) {
					window.console.log(jqxhr);
				});
			}
		},
		getValue: function(paymentSetting, key) {
			var value = _.findWhere(paymentSetting.credentials, {"apiName" : key});

			if (!value) 
				return;
			return value.value;
		},
		addCheckoutButton: function(id, isCart) {
			var self = this;
			if (!self.isEnabled) return;
			//var pageContext = require.mozuData('pagecontext');
			var redirectUrl = hyprlivecontext.locals.pageContext.secureHost;
			var checkoutUrl = hyprlivecontext.locals.siteContext.generalSettings.isMultishipEnabled ? "/checkoutv2" : "/checkout";

			if (!isCart)
				redirectUrl += checkoutUrl+"/"+id+"?isAwsCheckout=true&view="+self.viewName;
			else
				redirectUrl += "/cart?cartId="+id+"&isAwsCheckout=true&view="+self.viewName;
			EventBus.on("aws-script-loaded", function(){
				var authRequest;
				window.OffAmazonPayments.Button("AmazonPayButton", self.sellerId, { //use seller id
					type:  self.buttonType,
					color: self.buttonColor,
					useAmazonAddressBook: true,
					size: (!isCart ? "small" : "medium"),
					authorization: function() {
						var scope = "profile postal_code payments:widget payments:shipping_address payments:billing_address";
						var loginOptions = {scope: scope, popup: self.usePopUp};
						authRequest = window.amazon.Login.authorize (loginOptions,redirectUrl);
					},
					onError: function(error) {
						window.console.log("AmazonPay widget errorCode: "+error.getErrorCode());
						window.console.log("AmazonPay widget erorMessage: "+error.getErrorMessage());
					}
				});
			});
		},
		addAddressWidget: function(awsReferenceId) {
			loadAddressWidget(this.sellerId,awsReferenceId);
		},
		addWalletWidget: function(awsReferenceId) {
			loadWalletWidget(this.sellerId, awsReferenceId);
		}
	};
	return AmazonPay;

	function loadWalletWidget(sellerId,awsReferenceId) {
		var divId = "walletWidgetDiv";
		var walletData = {
			sellerId: sellerId,
			onPaymentSelect: function(orderReference) {
				EventBus.trigger("aws-card-selected");
			},
			design : {
				designMode: 'responsive'
			},
			onError: function(error) {
				window.console.log(error.getErrorCode());
				window.console.log(error.getErrorMessage());
			}
		};

		if (awsReferenceId) {
			divId = "readOnlyWalletWidgetDiv";
			walletData.displayMode = "Read";
			walletData.amazonOrderReferenceId = awsReferenceId;
		}
		new window.OffAmazonPayments.Widgets.Wallet(walletData).bind(divId);

	}

	function loadAddressWidget(sellerId,awsReferenceId) {
		var divId = "amazonAddressBookWidgetDiv";
		var addressWalletData = {
			sellerId: sellerId,
			design : {
				designMode: 'responsive'
			},
			onOrderReferenceCreate: function(orderReference) {
				var orderReferenceId = orderReference.getAmazonOrderReferenceId();
				EventBus.trigger("aws-referenceOrder-created", {"orderReferenceId": orderReferenceId});
			},
			onAddressSelect: function(orderReference) {

			},
			onError: function(error) {
				window.console.log("AmazonPay widget errorCode: "+error.getErrorCode());
				window.console.log("AmazonPay widget erorMessage: "+error.getErrorMessage());
			}
		};

		if (awsReferenceId) {
			delete addressWalletData.onOrderReferenceCreate;
			delete addressWalletData.onAddressSelect;
			addressWalletData.displayMode = "Read";
			addressWalletData.amazonOrderReferenceId = awsReferenceId;
		}
		new window.OffAmazonPayments.Widgets.AddressBook(addressWalletData).bind(divId);
	}
	
});
define('modules/checkout/steps/views-base-checkout-step',["modules/jquery-mozu",
    "underscore",
    "hyprlive",
    "modules/backbone-mozu",
    'hyprlivecontext',
    'modules/editable-view',
    'modules/amazonpay'],
    function ($, _, Hypr, Backbone, HyprLiveContext, EditableView, AmazonPay) {

var CheckoutStepView = EditableView.extend({
        edit: function () {
            this.model.edit();
        },
        next: function () {
            // wait for blur validation to complete
            var me = this;
            me.editing.savedCard = false;
            _.defer(function () {
                me.model.next();
            });
        },
        cancel: function(){
            this.model.cancelStep();
        },
        choose: function () {
            var me = this;
            me.model.choose.apply(me.model, arguments);
        },
        constructor: function () {
            var me = this;
            EditableView.apply(this, arguments);
            me.resize();
            setTimeout(function () {
                me.$('.mz-panel-wrap').css({ 'overflow-y': 'hidden'});
            }, 250);
            me.listenTo(me.model,'stepstatuschange', me.render, me);
            me.$el.on('keypress', 'input', function (e) {
                if (e.which === 13) {
                    me.handleEnterKey(e);
                    return false;
                }
            });
        },
        amazonShippingAndBilling: function() {
            var payments = window.order.get('payments');
            var amazonpayment = _.find(payments, function(payment){
                return payment.paymentType === 'token' || payment.paymentType === 'PayWithAmazon';
            });

            window.location = "/checkoutV2/"+window.order.id+"?isAwsCheckout=true&access_token="+amazonpayment.data.awsData.addressAuthorizationToken+"&view="+AmazonPay.viewName;
        },
        initStepView: function() {
            this.model.initStep();
        },
        handleEnterKey: function (e) {
            this.model.next();
        },
        render: function () {
            this.$el.removeClass('is-new is-incomplete is-complete is-invalid').addClass('is-' + this.model.stepStatus());
            EditableView.prototype.render.apply(this, arguments);
            this.resize();
        },
        toggleMultiShipMode : function() {
            this.model.toggleMultiShipMode();
            this.render();
        },
        resize: _.debounce(function () {
            this.$('.mz-panel-wrap').animate({'height': this.$('.mz-inner-panel').outerHeight() });
        },200)
    });
    return CheckoutStepView;
});

define('modules/checkout/steps/step1/views-shipping-info',["modules/jquery-mozu", 
    "underscore", 
    "hyprlive", 
    "modules/backbone-mozu", 
    'hyprlivecontext',
    "modules/checkout/steps/views-base-checkout-step",
    'modules/editable-view',
    'modules/checkout/models-shipping-destinations'], 
    function ($, _, Hypr, Backbone, HyprLiveContext, CheckoutStepView, EditableView, ShippingDestinationModels) {

        
        var GiftCardDestinationView = Backbone.MozuView.extend({
            templateName: 'modules/multi-ship-checkout/gift-card-destination',
            autoUpdate: [
                'email'
            ]
        });

        var ShippingDestinationContactView = Backbone.MozuView.extend({
            templateName: 'modules/common/address-form',
            requiredBehaviors: [1002],
            autoUpdate: [
                'firstName',
                'lastNameOrSurname',
                'address.address1',
                'address.address2',
                'address.address3',
                'address.cityOrTown',
                'address.countryCode',
                'address.stateOrProvince',
                'address.postalOrZipCode',
                'address.addressType',
                'phoneNumbers.home',
                'email'
            ],
            renderOnChange: [
                'address.countryCode'
            ]
        });

        var ShippingDestinationSingleView = Backbone.MozuView.extend({
            templateName: 'modules/multi-ship-checkout/shipping-destination-single-address',
            requiredBehaviors: [1002],
            initialize: function(){
                var self = this;
                this.listenTo(this.model, 'saveSingleDestination', function() {
                    self.saveSingleDestination();
                });
            },
            saveSingleDestination: function(){

            },
            chooseCandidateAddress: function(e) {
                var idx = parseInt($(e.currentTarget).val(), 10);
                if (idx !== -1) {
                    var addr = this.model.get('destinationContact').get('address');
                    var valAddr = addr.get('candidateValidatedAddresses')[idx];
                    for (var k in valAddr) {
                        addr.set(k, valAddr[k]);
                    }
                }
            }
        });

        var ShippingDestinationItemView = Backbone.MozuView.extend({
            templateName: 'modules/multi-ship-checkout/shipping-destinations-item',
            requiredBehaviors: [1002],
            additionalEvents: {
                "change [data-mz-fulfillment-contact]": "handleChangeDestinationAddress"
            },
            renderOnChange: [
                'fulfillmentInfoId',
                'fulfillmentContactId',
                'isLoading'
            ],
            initialize: function(){
                var self = this;
                this.listenTo(this.model, 'addedNewDestination', function() {
                    self.render();
                });
                this.listenTo(this.model, 'changeDestination', function() {
                    self.render();
                }); 
                this.listenTo(this.model, 'destinationsUpdate', function() {
                    self.render();
                });
            },
            handleChangeDestinationAddress: function(e){
                var self = this;
                var $target = $(e.currentTarget);
                var customerContactId = $target.find(":selected").data("mzCustomercontactid");
                if ($target.val() === "" && !customerContactId) {
                    return false;
                }
                self.model.updateOrderItemDestination($target.val(), customerContactId);
                self.render();
            },
            handleNewContact: function(e){
                this.model.set('editingDestination', true);
                this.model.addNewContact();
                //window.checkoutViews.contactDialog.openDialog();
                var self = this;
            },
            handleEditContact: function(e){
                var destinationId = this.model.get('destinationId');
                if(destinationId) {
                    //this.model.set('editingDestination', true);
                    this.model.editContact(destinationId);    
                }
            },
            handleSplitOrderItem: function(e){
                this.model.splitCheckoutItem();
            },
            handleRemoveDestination: function(e){
                var $target = $(e.currentTarget),
                    itemId = $target.parents('[data-mz-shipping-destinations-item]').data('mzItemId');

                this.model.removeDestination();
            }
        });

        // var ShippingDestinationView = Backbone.MozuView.extend({
        //     templateName: 'modules/multi-ship-checkout/shipping-destinations-items',
        //     requiredBehaviors: [1002],
        //     initialize: function(){
        //         var self = this;
        //         this.listenTo(this.model, 'addedNewDestination', function() {
        //             self.render();
        //         });
        //         this.listenTo(this.model, 'changeDestination', function() {
        //             self.render();
        //         });
        //         this.listenTo(this.model, 'destinationsUpdate', function() {
        //             self.render();
        //         });
        //     },
        //     render : function() {
        //         var self = this;
        //         Backbone.MozuView.prototype.render.apply(this, arguments);
        //         $.each(this.$el.find('[data-mz-shipping-destinations-item]'), function(index, val) {
        //             var shippingDestinationItemView = new ShippingDestinationItemView({
        //                 el: $(this),
        //                 model: self.model
        //             });
        //             shippingDestinationItemView.render();
        //         });  
        //     }
        // });

         var ComboShippingAddressView = CheckoutStepView.extend({
            templateName: 'modules/multi-ship-checkout/step-shipping-destinations',
            requiredBehaviors: [1002],
            renderOnChange: [
                'isMultiShipMode'
            ],
            additionalEvents: {
                "change [data-mz-single-fulfillment-contact]": "handleChangeSingleAddress"
            },
            isMultiShipMode: function(){
                if(this.model.isMultiShipMode()){
                    this.model.set('isMultiShipMode', true);
                } else {
                    this.model.set('isMultiShipMode', false);
                }
                return this.model.get('isMultiShipMode');
            },
            handleChangeSingleAddress: function(e){
                var self = this;
                var $target = $(e.currentTarget);
                var customerContactId = $target.find(":selected").data("mzCustomercontactid");
                
                if($target.val() === "" && !customerContactId) {
                    return false;
                }

                self.model.updateSingleCheckoutDestination($target.val(), customerContactId).ensure(function(){
                   //self.render(); 
                });
            },
            handleNewContact: function(e){
                this.model.set('editingDestination', true);
                this.model.addNewContact();
                //window.checkoutViews.contactDialog.openDialog();
                var self = this;
            },
            handleEditContact: function(e){
                var destinationId = $(e.target).data("mzDestinationid");

                this.model.get('destinationId');
                if(destinationId) {
                    //this.model.set('editingDestination', true);
                    this.model.editContact(destinationId);    
                }
            },
            initialize: function(){
                var self = this;
                this.listenTo(this.model.parent, 'sync', function() {
                    self.render();
                });
                this.listenTo(this.model.getDestinations(), 'destinationsUpdate', function() {
                    self.render();
                });
            },
            chooseCandidateAddress: function(e) {
                var idx = parseInt($(e.currentTarget).val(), 10);
                if (idx !== -1) {
                    var addr = this.model.getCheckout().get('destinations').singleShippingDestination().get('destinationContact').get('address');
                    var valAddr = addr.get('candidateValidatedAddresses')[idx];
                    for (var k in valAddr) {
                        addr.set(k, valAddr[k]);
                    }
                }
            },
            render: function(){
                var self = this;

                self.isMultiShipMode();

                this.$el.removeClass('is-new is-incomplete is-complete is-invalid').addClass('is-' + this.model.stepStatus());
                EditableView.prototype.render.apply(this, arguments);
                this.resize();


                $.each(this.$el.find('[data-mz-shipping-destinations-item]'), function(index, val) {
                    var id = $(this).data('mzItemId');
                    var shippingDestination = self.model.parent.get("items").findWhere({'id': id});
                    var shippingDestinationView = new ShippingDestinationItemView({
                        el: $(this),
                        model: shippingDestination
                    });
                    shippingDestinationView.render();
                });

                $.each(this.$el.find('[data-mz-shipping-destination-single]'), function(index, val) {
                    var shippingDestination = self.model.getCheckout().get('destinations').singleShippingDestination();
                    if(!shippingDestination) {
                        shippingDestination = self.model.getCheckout().get('destinations').newDestination();
                    }
                    var shippingDestinationSingleView = new ShippingDestinationSingleView({
                        el: $(this),
                        model: shippingDestination
                    });
                    shippingDestinationSingleView.render();

                     $.each($(this).find('[data-mz-address-form]'), function(index, val) {
                        var shippingDestinationContactView = new ShippingDestinationContactView({
                            el: $(this),
                            model: shippingDestination.get('destinationContact')
                        });
                    shippingDestinationContactView.render();
                    });

                });

                $.each(this.$el.find('[data-mz-gift-card-destination]'), function(index, val) {
                    var giftCardDestination = self.model.getCheckout().get('destinations').findWhere({'isGiftCardDestination': true});
                    if(!giftCardDestination) {
                        giftCardDestination = self.model.getCheckout().get('destinations').newGiftCardDestination();
                    }
                    var giftCardDestinationView = new GiftCardDestinationView({
                        el: $(this),
                        model: giftCardDestination.get('destinationContact')
                    });
                    giftCardDestinationView.render();
                });
            }
        });
         
        return ComboShippingAddressView;
});
define('modules/checkout/steps/step2/views-shipping-methods',["modules/jquery-mozu", 
    "underscore", 
    "hyprlive", 
    "modules/backbone-mozu", 
    'hyprlivecontext',
    "modules/checkout/steps/views-base-checkout-step",
    'modules/editable-view'], 
    function ($, _, Hypr, Backbone, HyprLiveContext, CheckoutStepView, EditableView) {
        var SingleShippingInfoView = CheckoutStepView.extend({
            templateName: 'modules/multi-ship-checkout/shipping-methods',
            renderOnChange: [
                'availableShippingMethods'
            ],
            additionalEvents: {
                "change [data-mz-shipping-method]": "updateShippingMethod"
            },
            updateShippingMethod: function (e) {
                this.model.updateShippingMethod(this.$('[data-mz-shipping-method]:checked').val());
            }
        });

        var MultiShippingInfoView = CheckoutStepView.extend({
            templateName: 'modules/multi-ship-checkout/step-shipping-methods',
            renderOnChange: [
                'availableShippingMethods'
            ],
            additionalEvents: {
                "change [data-mz-shipping-method]": "updateGroupingShippingMethod"
            },
             initialize: function(){
                var self = this;
                this.listenTo(this.model, 'shippingInfoUpdated', function() {
                    self.render(); 
                });
            },
            initStepView: function(){
                var self = this;
                 self.model.isLoading(true);
                CheckoutStepView.prototype.initStepView.apply(this, arguments);
                this.model.getCheckout().get('shippingStep').calculateStepStatus();
                if(this.model.getCheckout().get('requiresFulfillmentInfo') && this.model.getCheckout().get('shippingStep').stepStatus() == "complete") {
                    if(!this.model.getCheckout().get('shippingMethods').length) {
                        this.model.updateShippingMethods().then(function(){
                            var defaults = self.model.shippingMethodDefaults();
                            if(defaults.length){
                                self.model.getCheckout().get('shippingInfo').setDefaultShippingMethodsAsync(defaults).ensure(function(){
                                    self.model.calculateStepStatus();
                                    self.model.getCheckout().get('billingInfo').calculateStepStatus();
                                    self.model.isLoading(false);
                                });
                            } else {
                                 self.model.calculateStepStatus();
                                 self.model.getCheckout().get('billingInfo').calculateStepStatus();
                                 self.model.isLoading(false);
                            }
                        }, function(){
                            self.model.isLoading(false);
                            self.model.calculateStepStatus();
                        });
                    } else {
                        var defaults = self.model.shippingMethodDefaults();
                        if(defaults.length){
                            self.model.getCheckout().get('shippingInfo').setDefaultShippingMethodsAsync(defaults).ensure(function(){
                                self.model.calculateStepStatus();
                                self.model.getCheckout().get('billingInfo').calculateStepStatus();
                                self.model.isLoading(false);
                            });
                        } else {
                             
                             self.model.calculateStepStatus();
                             self.model.getCheckout().get('billingInfo').calculateStepStatus();
                             self.model.isLoading(false);
                        }
                    }

                }
            },
            updateGroupingShippingMethod: function(e) {
                var self = this;
                self.model.isLoading(true);
                var groupingId = $(e.currentTarget).attr('data-mz-grouping-id');
                var grouping = self.model.getCheckout().get('groupings').findWhere({id: groupingId});
                var shippingRates = self.model.getCheckout().get('shippingMethods').findWhere({groupingId: groupingId}).get('shippingRates');

                var shippingRate = _.findWhere(shippingRates, {shippingMethodCode: $(e.currentTarget).val()});
                grouping.set('shippingRate', shippingRate);
                grouping.set('shippingMethodCode', shippingRate.shippingMethodCode);
                self.model.getCheckout().syncApiModel();

                if(!$(e.currentTarget).selected) {
                    self.model.getCheckout().apiSetShippingMethod({groupId: groupingId, shippingRate: shippingRate}).ensure(function(){
                        self.model.isLoading(false);
                    });
                    // self.model.getCheckout().apiSetShippingMethods().then(function(){

                    // });
                }
            },
            render: function(){
                var self = this;
                this.$el.removeClass('is-new is-incomplete is-complete is-invalid').addClass('is-' + this.model.stepStatus());
                //this.model.initSet();
                // var hasDestinations = self.model.getCheckout().get('items').filter(function(item){
                //     return item.get('destinationId');
                // });
                // if(self.model.getCheckout().get('groupings').length && !self.model.getCheckout().get('shippingMethods').length && hasDestinations.length == self.model.getCheckout().get('items').length) {
                //     self.model.getCheckout().apiModel.getAvaiableShippingMethods().then(function (methods) {
                //         self.model.refreshShippingMethods(methods);
                //         self.model.shippingInfoUpdated();
                //         //self.calculateStepStatus();
                //         //self.isLoading(false);
                //     });   
                // }

                EditableView.prototype.render.apply(this, arguments);
                this.resize();
            }
        });

        return MultiShippingInfoView;
});
define('modules/models-location',["modules/jquery-mozu", "modules/backbone-mozu", "hyprlive", "modules/api"], 
    function ($, Backbone, Hypr, api) {

        var Location = Backbone.MozuModel.extend({
            mozuType: 'location',
            idAttribute: 'code'
        });

        var LocationCollection = Backbone.MozuModel.extend({
            mozuType: 'locations',
            relations: {
                items: Backbone.Collection.extend({
                    model: Location
                })
            }
        });

        return {
            Location: Location,
            LocationCollection: LocationCollection
        };
    }
);
define('modules/models-discount',["backbone", 'underscore', 'hyprlive', 'modules/api', 'modules/models-product'], function (Backbone, _, Hypr, api, ProductModels) {

    // var discountProductModel = ProductModels.Product.extend({
    //     initialize: function(conf) {
    //         Backbone.MozuView.prototype.initialize.apply(this, arguments);
    //         if(this.get(discount))
    //     }
    // });

    var discountModel = Backbone.MozuModel.extend({
        mozuType: 'discounts',
        relations: {
            products: Backbone.Collection.extend({
                model: ProductModels.Product
            })
        },
        defaults: {
            productCode: "",
            hasMultipleProducts: false
        },
        getProductDetails: function (productCode) {
            var self = this;
            productCode = productCode || this.get('productCode');

            if (!productCode || productCode === "") {
                this.trigger('error', 'No Product Code Found');
                throw 'No Product Code Found';
            }

            var productModel = new ProductModels.Product({ productCode: productCode });
            return productModel.apiGet({ productCode: productCode, acceptVariantProductCode: true }).then(function (data) {
                //self.get('products').reset([data.data]);
                return data.data;
            });
        },
        getDiscountDetails: function () {
            var self = this;
            return self.apiGet();
        },
        tagVariationOptions: function (productCode, data) {
            var self = this;
            var variationMap = {};
            var variation = _.find(data.variations, function (v) {
                return v.productCode === productCode;
            });

            if (variation) {
                _.each(variation.options, function (variationOption) {
                    _.each(data.options, function (option, optionIdx) {
                        if (option.attributeFQN === variationOption.attributeFQN) {
                            var valueIdx = _.findIndex(option.values, function (v) {
                                return v.value === variationOption.value;
                            });
                            data.options[optionIdx].values[valueIdx].autoAddEnabled = true;
                            return false;
                        }
                    });
                });
                data.variationCollection = true;
            }
            return data;
        },
        getDiscountProducts: function () {
            var self = this;
            var deferred = api.defer();
            var products = [];

            var hasBaseProduct = function (products, variationCode) {
                return _.findIndex(products, function (product) {
                    return _.find(product.variations, function (variation) {
                        return variation.productCode === variationCode;
                    });
                });
            };

            var getVariationBase = function (productCode) {
                    return self.getProductDetails(productCode).then(function (data) {
                        data = self.tagVariationOptions(productCode, data);
                        products.push(data);
                        self.get('products').add(data);
                        return data;
                    });
            };

            var removeVaritionsWithBase = function (unFoundProducts) {
                _.each(unFoundProducts, function (productCode) {
                    var foundProductIdx = hasBaseProduct(unFoundProducts, productCode);
                    if (foundProductIdx) {
                        unFoundProducts = unFoundProducts.splice(foundProductIdx, 1);
                    }
                });
                return unFoundProducts;
            };

            self.getAllProductDetails().then(function (data) {

                products = data;
                self.get('products').add(data);

                var unFoundProducts = _.reject(self.get('productCodes'), function (productCode) {
                    return _.find(products, function (product) {
                        return product.productCode === productCode;
                    });
                });

                var getVariationBases = function(){
                    var baseProductIdx = hasBaseProduct(products, unFoundProducts[unFoundProducts.length - 1]);
                    if (baseProductIdx === -1 && unFoundProducts.length) {
                        getVariationBase(unFoundProducts[unFoundProducts.length - 1]).then(function () {
                            unFoundProducts.splice(unFoundProducts.length-1, 1);
                                //unFoundProducts = removeVaritionsWithBase(unFoundProducts);
                                return getVariationBases();
                        });
                        return;
                    } else if (baseProductIdx != -1 && unFoundProducts.length) {
                            self.tagVariationOptions(unFoundProducts[unFoundProducts.length - 1], products[baseProductIdx]);
                            unFoundProducts.splice(unFoundProducts.length - 1, 1);
                            return getVariationBases();
                    }
                    return deferred.resolve(products);
                };
                getVariationBases();
                return data;
            });
            return deferred.promise;
        },
        getAllProductDetails: function () {
            var self = this;
            var filter = '';
            _.forEach(self.get('productCodes'), function (code, idx) {
                if (idx === 0) {
                    filter += 'productCode eq ' + code;
                    return;
                }
                filter += ' or productCode eq ' + code;
            });

            return api.get('products', { filter: filter }).then(function (data) {
                var mappedProducts = _.map(data, function (product) {
                    return product.data;
                });

                _.forEach(mappedProducts, function (product, idx) {
                    if (product.isVariation) {
                        var foundBaseProduct = _.findWhere(mappedProducts, { productCode: product.baseProductCode });
                        if (foundBaseProduct) {
                            foundBaseProduct.options.add(product.option);
                            delete mappedProducts[idx];
                            return;
                        }
                        mappedProducts[idx].productCode = product.baseProductCode;
                        mappedProducts[idx].productCode.options = [product.option];
                    }
                });

                self.get('products').reset(mappedProducts);
                return mappedProducts;
            });
        }
    });
    return discountModel;
});
define('modules/cart/discount-dialog/models-discount-dialog',["backbone", 'underscore', 'hyprlive', 'modules/api', 'modules/models-product', 'modules/models-dialog', 'modules/models-discount' ], function(Backbone, _, Hypr, Api, ProductModels, Dialog, DiscountModel) {

    var modalDialog = Dialog.extend({
        handlesMessages: true,
        relations : {
            product: ProductModels.Product,
            discounts: Backbone.Collection.extend({
                model: DiscountModel
            }),
            discount: DiscountModel
        },
        hasNextDiscount: function() {
            return this.get('discounts').find(function (discount) {
                return !discount.get('complete') && ((discount.get('autoAdd') || (discount.get('hasOptions') || discount.get('hasMultipleProducts'))));
                //return !discount.get('complete');
            });
        },
        loadNextDiscount: function(){
            // var nextDiscount = this.get('discounts').find(function(discount){
            //     return !discount.get('complete');
            // });
            // if (nextDiscount) {
            //     this.setNewDiscount(nextDiscount);
            // }
            var self = this;
            var nextDiscount = this.get('discounts').find(function (discount) {
                return !discount.get('complete');
            });
            if (nextDiscount) {
                this.setNewDiscount(nextDiscount);
                if( this.get('discount').get('hasMultipleProducts') ){
                    return this.get('discount').getDiscountDetails().then(function(discount){
                        self.get('discount').set('productCodes', discount.includedProductCodes);
                    });
                } else {
                    return this.get('discount').getProductDetails().then(function(data){
                        if (self.get('discount').get('hasOptions')) {
                            data = self.get('discount').tagVariationOptions(self.get('discount').get('productCode'), data);
                        }
                        self.get('discount').get('products').reset([data]);
                    });
                }
            }
        },
        completeDiscount:function(){
            var self = this;
            if (self.hasDiscount()) {
                var discount = this.get('discounts').findWhere({ discountId: self.get('discount').get('discountId') });
                discount.set('complete', true);
            }
        },
        addDiscounts: function(discounts){
            this.set('discounts', discounts);
            this.setNewDiscount(discounts[0]);
        },
        setNewDiscount: function(discount){
            if (!discount.complete) {
                this.set('discount', discount);
                //this.trigger('newDiscountSet');
            }
        },
        initialize: function () {
            //this.set('order', new OrderModels.Order({})); 
        },
        hasDiscount: function(){
            return !(_.isEmpty(this.get('discount')));
        },
        hasMultipleProducts: function () {
            return this.get('discount').get('hasMultipleProducts');
        },
        // getProductDetails: function(productCode){
        //     var self = this;
        //     var productCode = productCode || this.get('discount').productCode

        //     if( !productCode || productCode === "" ){
        //         this.trigger('error', 'No Product Code Found');
        //         throw 'No Product Code Found';
        //     }
            
        //     var productModel = new ProductModels.Product({productCode: productCode});
        //     return productModel.apiGet().then(function(data){
        //         self.set('product', data.data);
        //         return data.data;
        //     })   
        // },
        isProductConfigurable: function(){
            return this.get('discount').get('products').at(0).get('productUsage') === "Configurable";
        },
        productHasOptions: function () {
            return this.get('discount').get('hasOptions');
        },
        isDiscountAutoAdd: function(){
            return this.get('discount').get('autoAdd');
        },
        autoAddProduct: function() {
            var self = this;
            var process = [];

            var bogaProduct = new ProductModels.Product({ productCode: self.get('discount').get('products').at(0).get('productCode')});
            process.push(function () {
                return bogaProduct.fetch();
            });
            process.push(function () {
                return bogaProduct.apiAddToCart({ autoAddDiscountId: self.get('discount').get('discountId') }).then(function (cartItem) {
                    return cartItem;
                });
            });
            return Api.steps(process);
        }
        // getDiscount: function(){
        //     var temp = new Promise(function (resolve, reject) {
        //         setTimeout(function () {
        //             testData = {
        //                     name: "Discount 1",
        //                     productCodes: ['4101', '4104', 'config-1', 'config-1-2']
        //                 };
        //             resolve(testData);
        //         }, 300);
        //     });
        //     return temp
        // }
    });

    return modalDialog;
});

define('modules/models-cart',['underscore', 'modules/backbone-mozu', 'hyprlive', "modules/api", "modules/models-product",
    "hyprlivecontext", 'modules/models-location', 'modules/cart/discount-dialog/models-discount-dialog'
  ], function (_, Backbone, Hypr, api, ProductModels,
      HyprLiveContext, LocationModels, DiscountDialogModels) {

    var CartItemProduct = ProductModels.Product.extend({
        helpers: ['mainImage','directShipSupported', 'inStorePickupSupported'],
        mainImage: function() {
            var imgs = this.get("productImages"),
                img = imgs && imgs[0],
                imgurl = 'http://placehold.it/160&text=' + Hypr.getLabel('noImages');
            return img || { ImageUrl: imgurl, imageUrl: imgurl }; // to support case insensitivity
        },
        initialize: function() {
            var url = (HyprLiveContext.locals.siteContext.siteSubdirectory || '')  + "/product/" + this.get("productCode");
            this.set({ Url: url, url: url });
        },
        directShipSupported: function(){
            return (_.indexOf(this.get('fulfillmentTypesSupported'), "DirectShip") !== -1) ? true : false;
        },
        inStorePickupSupported: function(){
            return (_.indexOf(this.get('fulfillmentTypesSupported'), "InStorePickup") !== -1) ? true : false;
        }

    }),

    CartItem = Backbone.MozuModel.extend({
        relations: {
            product: CartItemProduct
        },
        validation: {
            quantity: {
                min: 1
            }
        },
        dataTypes: {
            quantity: Backbone.MozuModel.DataTypes.Int
        },
        mozuType: 'cartitem',
        handlesMessages: true,
        helpers: ['priceIsModified', 'storeLocation'],
        priceIsModified: function() {
            var price = this.get('unitPrice');
            return price.baseAmount != price.discountedAmount;
        },
        saveQuantity: function() {
            var self = this;
            var oldQuantity = this.previous("quantity");
            if (this.hasChanged("quantity")) {
                this.apiModel.updateQuantity(this.get("quantity"))
                    .then(
                        function() {
                            //self.collection.parent.checkBOGA();
                        },
                        function() {
                            // Quantity update failed, e.g. due to limited quantity or min. quantity not met. Roll back.
                            self.set("quantity", oldQuantity);
                            self.trigger("quantityupdatefailed", self, oldQuantity);
                        }
                    );
            }
        },
        storeLocation: function(){
            var self = this;
            if(self.get('fulfillmentLocationCode')) {
                return self.collection.parent.get('storeLocationsCache').getLocationByCode(self.get('fulfillmentLocationCode'));
            }
            return;
        }
    }),
    StoreLocationsCache = Backbone.Collection.extend({
        addLocation : function(location){
          this.add(new LocationModels.Location(location), {merge: true});
        },
        getLocations : function(){
            return this.toJSON();
        },
        getLocationByCode : function(code){
            if(this.get(code)){
                return this.get(code).toJSON();
            }
        }
    }),

    Cart = Backbone.MozuModel.extend({
        mozuType: 'cart',
        handlesMessages: true,
        helpers: ['isEmpty','count','hasRequiredBehavior'],
        relations: {
            items: Backbone.Collection.extend({
                model: CartItem
            }),
            storeLocationsCache : StoreLocationsCache,
            discountModal: DiscountDialogModels
        },
        requiredBehaviors: [ 1008 ],
        initialize: function() {
            var self = this;
            this.get("items").on('sync remove', this.fetch, this)
                             .on('loadingchange', this.isLoading, this);

            this.get("items").each(function(item, el) {
                if(item.get('fulfillmentLocationCode') && item.get('fulfillmentLocationName')) {
                    self.get('storeLocationsCache').addLocation({
                        code: item.get('fulfillmentLocationCode'),
                        name: item.get('fulfillmentLocationName')
                    });
                }
            });

            this.get('discountModal').set('discounts', this.getSuggestedDiscounts());
        },
        getSuggestedDiscounts: function(){
            var self = this;

            var rejectedDiscounts = self.get('rejectedDiscounts') || [];
            var suggestedDiscounts = self.get('suggestedDiscounts') || [];
            var filteredDiscounts = [];
            if (suggestedDiscounts.length) {
                filteredDiscounts = _.filter(suggestedDiscounts, function(discount){
                    return !_.findWhere(rejectedDiscounts, {discountId: discount.discountId});
                });
            }
            return filteredDiscounts;
        },
        checkBOGA: function(){
          //Called whenever we would need to add an additional item to the cart
          //due to a BOGA discount (cart initialization and after application
          // of a coupon code)
          var me = this;
          var suggestedDiscounts = this.get("suggestedDiscounts") || [];

          // First we filter our list down to
          // just the products we know we want added.
          var productsToAdd = [];
          suggestedDiscounts.forEach(function(discountItem){
            var cartHasDiscountItem = me.get('items').some(function(cartItem){
              return discountItem.productCode === cartItem.productCode;
            });

            if (discountItem.autoAdd && !cartHasDiscountItem){
              productsToAdd.push(discountItem);
            }
          });

          // We now have a list of productsToAdd.
          // We'll define a function to fetch and re render the cart after
          // each of the product fetches have been completed.

          var renderCartWhenFinished = _.after(productsToAdd.length, function(){
            me.fetch().then(function(){
              me.trigger('render');
            });
          });
          // We define a recursive function to assure that each product code
          // gets added to the cart sequentially.
          var addProductsToCart = function(productIndex){
            var totalLength = productsToAdd.length;
            var currentIndex = productIndex || 0;

            if (productsToAdd[currentIndex]){
              var productToAdd = productsToAdd[currentIndex];
              var bogaProduct = new CartItemProduct({productCode: productToAdd.productCode});
              bogaProduct.fetch().then(function(){
                bogaProduct.apiAddToCart({autoAddDiscountId: productToAdd.discountId}).then(function(cartItem){
                  var nextProductIndex = currentIndex + 1;
                  renderCartWhenFinished();
                  addProductsToCart(nextProductIndex);
                });
              }, function(error){
                // Something went wrong with fetching one of the products.
                // We don't want this to halt the whole process.
                var nextProductIndex = currentIndex + 1;
                renderCartWhenFinished();
                addProductsToCart(nextProductIndex);
              });
            }
          };
          addProductsToCart();
        },
        isEmpty: function() {
            return this.get("items").length < 1;
        },
        count: function() {
            return this.apiModel.count();
            //return this.get("Items").reduce(function(total, item) { return item.get('Quantity') + total; },0);
        },
        toOrder: function() {
            var me = this;
            me.apiCheckout().then(function(order) {
                me.trigger('ordercreated', order);
            });
        },
        toCheckout: function() {
            var me = this;
            me.apiCheckout2().then(function(checkout) {
                me.trigger('checkoutcreated', checkout);
            });
        },
        removeItem: function (id) {
            return this.get('items').get(id).apiModel.del();
        },
        addCoupon: function () {
            var me = this;
            var code = this.get('couponCode');
            var orderDiscounts = me.get('orderDiscounts');
            if (orderDiscounts && _.findWhere(orderDiscounts, { couponCode: code })) {
                // to maintain promise api
                var deferred = api.defer();
                deferred.reject();
                deferred.promise.otherwise(function () {
                    me.trigger('error', {
                        message: Hypr.getLabel('promoCodeAlreadyUsed', code)
                    });
                });
                return deferred.promise;
            }
            this.isLoading(true);
            return this.apiAddCoupon(this.get('couponCode')).then(function () {
                me.set('couponCode', '');
                var productDiscounts = _.flatten(_.pluck(_.pluck(me.get('items').models, 'attributes'), 'productDiscounts'));
                var shippingDiscounts = _.flatten(_.pluck(_.pluck(me.get('items').models, 'attributes'), 'shippingDiscounts'));

                var allDiscounts = me.get('orderDiscounts').concat(productDiscounts).concat(shippingDiscounts);
                var allCodes = me.get('couponCodes') || [];
                var lowerCode = code.toLowerCase();

                var couponExists = _.find(allCodes, function(couponCode) {
                    return couponCode.toLowerCase() === lowerCode;
                });
                if (!couponExists) {
                    me.trigger('error', {
                        message: Hypr.getLabel('promoCodeError', code)
                    });
                }

                var couponIsNotApplied = (!allDiscounts || !_.find(allDiscounts, function(d) {
                    return d.couponCode && d.couponCode.toLowerCase() === lowerCode;
                }));
                me.set('tentativeCoupon', couponExists && couponIsNotApplied ? code : undefined);
                if (me.getSuggestedDiscounts().length) {
                    me.get('discountModal').set('discounts', me.getSuggestedDiscounts());
                    window.cartView.discountModalView.render();
                }
                me.isLoading(false);
            });
        },
        toJSON: function(options) {
            var j = Backbone.MozuModel.prototype.toJSON.apply(this, arguments);
            return j;
        }
    });

    return {
        CartItem: CartItem,
        Cart: Cart
    };
});

define('modules/xpress-paypal',['modules/jquery-mozu',
        "modules/api",
        'modules/models-cart',
        'hyprlivecontext',
        'underscore'],
function($, Api, CartModels, hyprlivecontext, _) {
    var siteContext = hyprlivecontext.locals.siteContext,
        externalPayment = _.findWhere(siteContext.checkoutSettings.externalPaymentWorkflowSettings, {"name" : "PayPalExpress2"});

    window.paypalCheckoutReady = function() {

      var siteContext = hyprlivecontext.locals.siteContext,
          externalPayment = _.findWhere(siteContext.checkoutSettings.externalPaymentWorkflowSettings, {"name" : "PayPalExpress2"});
    
       if (!externalPayment || !externalPayment.isEnabled) return;

       var merchantAccountId = _.findWhere(externalPayment.credentials, {"apiName" : "merchantAccountId"}),
          environment = _.findWhere(externalPayment.credentials, {"apiName" : "environment"}),
          id = CartModels.Cart.fromCurrent().id || window.order.id,
          isCart = window.location.href.indexOf("cart") > 0;
      if(externalPayment.isEnabled) {
        window.paypal.checkout.setup(merchantAccountId.value, {
            environment: environment.value,
            click: function(event) {
                event.preventDefault();
                var url = "../paypal/token?id=" + id + (!document.URL.split('?')[1] ? "": "&" + document.URL.split('?')[1].replace("id="+id,"").replace("&&", "&"));
                if (isCart)
                  url += "&isCart="+ isCart;
                window.paypal.checkout.initXO();
                $.ajax({
                    url: url,
                    type: "GET",
                    async: true,

                    //Load the minibrowser with the redirection url in the success handler
                    success: function (token) {
                        var url = window.paypal.checkout.urlPrefix + token.token;
                        //Loading Mini browser with redirect url, true for async AJAX calls
                        window.paypal.checkout.startFlow(url);
                    },
                    error: function (responseData, textStatus, errorThrown) {
                        //window.console.log("Error in ajax post " + responseData.statusText);
                        //Gracefully Close the minibrowser in case of AJAX errors
                        window.paypal.checkout.closeFlow();
                    }
                });
            },
            button: ['btn_xpressPaypal']
        });
      }
    };
    var paypal = {
      scriptLoaded: false,
     loadScript: function() {
      if(externalPayment && externalPayment.isEnabled){
        var self = this;
         if (this.scriptLoaded) return;
          this.scriptLoaded = true;
        $.getScript("//www.paypalobjects.com/api/checkout.js").done(function(scrit, textStatus){
          //window.console.log(textStatus);
        }).fail(function(jqxhr, settings, exception) {
          //window.console.log(jqxhr);
        });
      }
     }
   };
   return paypal;
});

define('modules/models-checkout',[
    'modules/jquery-mozu',
    'underscore',
    'hyprlive',
    'modules/backbone-mozu',
    'modules/api',
    'modules/models-customer',
    'modules/models-address',
    'modules/models-paymentmethods',
    'hyprlivecontext'
],
    function ($, _, Hypr, Backbone, api, CustomerModels, AddressModels, PaymentMethods, HyprLiveContext) {

        var CheckoutStep = Backbone.MozuModel.extend({
            helpers: ['stepStatus', 'requiresFulfillmentInfo','isAwsCheckout','isNonMozuCheckout', 'requiresDigitalFulfillmentContact','isShippingEditHidden'],  //
            // instead of overriding constructor, we are creating
            // a method that only the CheckoutStepView knows to
            // run, so it can run late enough for the parent
            // reference in .getOrder to exist;
            initStep: function () {
                var me = this;
                this.next = (function(next) {
                    return _.debounce(function() {
                        if (!me.isLoading()) next.call(me);
                    }, 750, true);
                })(this.next);
                var order = me.getOrder();
                me.calculateStepStatus();
                me.listenTo(order, 'error', function () {
                    if (me.isLoading()) {
                        me.isLoading(false);
                    }
                });
                me.set('orderId', order.id);
                if (me.apiModel) me.apiModel.on('action', function (name, data) {
                    if (data) {
                        data.orderId = order.id;
                    } else {
                        me.apiModel.prop('orderId', order.id);
                    }
                });
            },
            calculateStepStatus: function () {
                // override this!
                var newStepStatus = this.isValid(!this.stepStatus()) ? 'complete' : 'invalid';
                return this.stepStatus(newStepStatus);
            },
            getOrder: function () {
                return this.parent;
            },
            stepStatus: function (newStatus) {
                if (arguments.length > 0) {
                    this._stepStatus = newStatus;
                    this.trigger('stepstatuschange', newStatus);
                }
                return this._stepStatus;
            },
            requiresFulfillmentInfo: function () {
                return this.getOrder().get('requiresFulfillmentInfo');
            },
            isAwsCheckout: function() {
                var activePayments = this.getOrder().apiModel.getActivePayments();
                if (activePayments) {
                    var tokenPayment = _.findWhere(activePayments, { paymentType: 'token' });
                    if (tokenPayment && tokenPayment.billingInfo.token && tokenPayment.billingInfo.token.type.toLowerCase() == "paywithamazon")
                        return true;

                    var legacyPWA = _.findWhere(activePayments, { paymentType: 'PayWithAmazon' });
                    if (legacyPWA) return true;

                    return false;
                } else
                   return false;
            },
            isNonMozuCheckout: function() {
                var activePayments = this.getOrder().apiModel.getActivePayments();
                if (activePayments && activePayments.length === 0) return false;
                return (activePayments && (_.findWhere(activePayments, { paymentType: 'PayPalExpress2' }) || this.isAwsCheckout() ));
            },
            isShippingEditHidden: function() {
                if (HyprLiveContext.locals.themeSettings.changeShipping) return false;

                return this.isNonMozuCheckout();
            },
            requiresDigitalFulfillmentContact: function () {
                return this.getOrder().get('requiresDigitalFulfillmentContact');
            },
            edit: function () {
                this.stepStatus('incomplete');
            },
            next: function () {
                if (this.submit()) this.isLoading(true);
            },
            cancelStep: function() {
                var me = this,
                order = me.getOrder();
                    me.isLoading(true);
                    order.apiModel.get().ensure(function(){
                        me.isLoading(false);
                        return me.stepStatus("complete");
                });
            }
        }),

        FulfillmentContact = CheckoutStep.extend({
            relations: CustomerModels.Contact.prototype.relations,
            validation: CustomerModels.Contact.prototype.validation,
            digitalOnlyValidation: {
                'email': {
                    pattern: 'email',
                    msg: Hypr.getLabel('emailMissing')
                }
            },
            dataTypes: {
                contactId: function(val) {
                    return (val === 'new') ? val : Backbone.MozuModel.DataTypes.Int(val);
                }
            },
            helpers: ['contacts'],
            contacts: function () {
                var contacts = this.getOrder().get('customer').get('contacts').toJSON();
                return contacts && contacts.length > 0 && contacts;
            },
            initialize: function () {
                var self = this;
                this.on('change:contactId', function (model, newContactId) {
                    if (!newContactId || newContactId === 'new') {
                        model.get('address').clear();
                        model.get('phoneNumbers').clear();
                        model.unset('id');
                        model.unset('firstName');
                        model.unset('lastNameOrSurname');
                    } else {
                        model.set(model.getOrder().get('customer').get('contacts').get(newContactId).toJSON(), {silent: true});
                    }
                });
            },
            calculateStepStatus: function () {
                if (!this.requiresFulfillmentInfo() && this.requiresDigitalFulfillmentContact()) {
                    this.validation = this.digitalOnlyValidation;
                }

                if (!this.requiresFulfillmentInfo() && !this.requiresDigitalFulfillmentContact()) return this.stepStatus('complete');
                return CheckoutStep.prototype.calculateStepStatus.apply(this);
            },
            getOrder: function () {
                // since this is one step further away from the order, it has to be accessed differently
                return this.parent.parent;
            },
            choose: function (e) {
                var idx = parseInt($(e.currentTarget).val(), 10);
                if (idx !== -1) {
                    var addr = this.get('address');
                    var valAddr = addr.get('candidateValidatedAddresses')[idx];
                    for (var k in valAddr) {
                        addr.set(k, valAddr[k]);
                    }
                }
            },
            toJSON: function () {
                if (this.requiresFulfillmentInfo() || this.requiresDigitalFulfillmentContact()) {
                    return CheckoutStep.prototype.toJSON.apply(this, arguments);
                }
            },
            isDigitalValid: function() {
                var email = this.get('email');
                return (!email) ? false : true;
            },
            nextDigitalOnly: function () {
                var order = this.getOrder(),
                    me = this;
                if (this.validate()) return false;
                this.getOrder().apiModel.update({ fulfillmentInfo: me.toJSON() }).ensure(function () {
                    me.isLoading(false);
                    order.messages.reset();
                    order.syncApiModel();

                    me.calculateStepStatus();
                    return order.get('billingInfo').calculateStepStatus();
                });
            },
            next: function () {
                if (!this.requiresFulfillmentInfo() && this.requiresDigitalFulfillmentContact()) {
                    return this.nextDigitalOnly();
                }

                var validationObj = this.validate();

                if (validationObj) { 
                    /*
                    Object.keys(validationObj).forEach(function(key){
                        this.trigger('error', {message: validationObj[key]});
                    }, this);
                    */
                    return false;
                }

               var parent = this.parent,
                    order = this.getOrder(),
                    me = this,
                    isAddressValidationEnabled = HyprLiveContext.locals.siteContext.generalSettings.isAddressValidationEnabled,
                    allowInvalidAddresses = HyprLiveContext.locals.siteContext.generalSettings.allowInvalidAddresses;
                this.isLoading(true);
                var addr = this.get('address');
                var completeStep = function () {
                    order.messages.reset();
                    order.syncApiModel();
                    me.isLoading(true);
                    order.apiModel.getShippingMethodsFromContact().then(function (methods) {
                        parent.unset("shippingMethodCode");
                        order.apiModel.update({ fulfillmentInfo: parent.toJSON() })
                        .then(function (o) {
                            console.log("unset the shipping method");
                        });
                        return parent.refreshShippingMethods(methods);
                    }).ensure(function () {
                        addr.set('candidateValidatedAddresses', null);

                        var currentPayment = order.apiModel.getCurrentPayment();
                        if (currentPayment && order.get('billingInfo').get('isSameBillingShippingAddress')) {
                            order.apiVoidPayment(currentPayment.id).then(function(){
                                    order.get('billingInfo').applyPayment().then(function(){
                                    var oBilling = order.get('billingInfo').get('billingContact').toJSON();
                                    order.get('billingInfo').get('billingContact').set(order.get('fulfillmentInfo').get('fulfillmentContact').toJSON());
                                    order.get('billingInfo').get('billingContact').set('email', oBilling.email);
                                    order.get('billingInfo').trigger('billingContactUpdate');
                                }).ensure(function () {
                                    me.isLoading(false);
                                    parent.isLoading(false);
                                    me.calculateStepStatus();
                                    parent.calculateStepStatus();
                                });
                            });
                        } else {
                            me.isLoading(false);
                            parent.isLoading(false);
                            me.calculateStepStatus();
                            parent.calculateStepStatus();
                        }
                    });
                };

                var promptValidatedAddress = function () {
                    order.syncApiModel();
                    me.isLoading(false);
                    parent.isLoading(false);
                    me.stepStatus('invalid');
                };

                if (!isAddressValidationEnabled) {
                    completeStep();
                } else {
                    if (!addr.get('candidateValidatedAddresses')) {
                        var methodToUse = allowInvalidAddresses ? 'validateAddressLenient' : 'validateAddress';
                        addr.syncApiModel();
                        addr.apiModel[methodToUse]().then(function (resp) {
                            if (resp.data && resp.data.addressCandidates && resp.data.addressCandidates.length) {
                                if (_.find(resp.data.addressCandidates, addr.is, addr)) {
                                    addr.set('isValidated', true);
                                        completeStep();
                                        return;
                                    }
                                addr.set('candidateValidatedAddresses', resp.data.addressCandidates);
                                promptValidatedAddress();
                            } else {
                                completeStep();
                            }
                        }, function (e) {
                            if (allowInvalidAddresses) {
                                // TODO: sink the exception.in a better way.
                                order.messages.reset();
                                completeStep();
                            } else {
                                order.messages.reset({ message: Hypr.getLabel('addressValidationError') });
                            }
                        });
                    } else {
                        completeStep();
                    }
                }
            }
        }),

        FulfillmentInfo = CheckoutStep.extend({
            initialize: function () {
                var me = this;
                this.on('change:availableShippingMethods', function (me, value) {
                    me.updateShippingMethod(me.get('shippingMethodCode'), true);
                });
                _.defer(function () {
                    // This adds the price and other metadata off the chosen
                    // method to the info object itself.
                    // This can only be called after the order is loaded
                    // because the order data will impact the shipping costs.
                    //me.updateShippingMethod(me.get('shippingMethodCode'), true);
                });
            },
            relations: {
                fulfillmentContact: FulfillmentContact
            },
            validation: {
                shippingMethodCode: {
                    required: true,
                    msg: Hypr.getLabel('chooseShippingMethod')
                }
            },
            refreshShippingMethods: function (methods) {
                this.set({
                    availableShippingMethods: methods
                });

                // always make them choose again
                _.each(['shippingMethodCode', 'shippingMethodName'], this.unset, this);

                // after unset we need to select the cheapest option
                this.updateShippingMethod();
            },
            calculateStepStatus: function () {
                // If no shipping required, we're done.
                if (!this.requiresFulfillmentInfo()) return this.stepStatus('complete');

                // If there's no shipping address yet, go blank.
                if (this.get('fulfillmentContact').stepStatus() !== 'complete') {
                    return this.stepStatus('new');
                }

                // Incomplete status for shipping is basically only used to show the Shipping Method's Next button,
                // which does nothing but show the Payment Info step.
                var billingInfo = this.parent.get('billingInfo');
                if (!billingInfo || billingInfo.stepStatus() === 'new') return this.stepStatus('incomplete');

                // Payment Info step has been initialized. Complete status hides the Shipping Method's Next button.
                return this.stepStatus('complete');
            },
            updateShippingMethod: function (code, resetMessage) {
                if(!code){
                    code = window.checkoutViews.parentView.model.get("fulfillmentInfo").get('prevoiusSelectedMethod');
                }
                var available = this.get('availableShippingMethods'),
                    newMethod = _.findWhere(available, { shippingMethodCode: code }),
                    lowestValue = _.min(available, function(ob) { return ob.price; }); // Returns Infinity if no items in collection.

                if (!newMethod && available && available.length && lowestValue) {
                    newMethod = lowestValue;
                }
                if (newMethod) {
                    this.set(newMethod);
                    this.applyShipping(resetMessage);
                }
            },
            applyShipping: function(resetMessage) {
                if (this.validate()) return false;
                var me = this;
                this.isLoading(true);
                var order = this.getOrder();
                if (order) {
                    order.apiModel.update({ fulfillmentInfo: me.toJSON() })
                        .then(function (o) {
                            var billingInfo = me.parent.get('billingInfo');
                            if (billingInfo) {
                                billingInfo.loadCustomerDigitalCredits();
                                // This should happen only when order doesn't have payments..
                                billingInfo.updatePurchaseOrderAmount();
                            }
                        })
                        .ensure(function() {
                            me.isLoading(false);
                            me.calculateStepStatus();
                            me.parent.get('billingInfo').calculateStepStatus();
                            if(resetMessage) {
                                me.parent.messages.reset(me.parent.get('messages'));
                            }

                            //In order to resync our billing address with shipping.
                            //Not a great fix, look into correcting.
                            if(order.get('billingInfo').get('isSameBillingShippingAddress')) {
                                var oBilling = order.get('billingInfo').get('billingContact').toJSON();
                                order.get('billingInfo').get('billingContact').set(order.get('fulfillmentInfo').get('fulfillmentContact').toJSON());
                                order.get('billingInfo').get('billingContact').set('email', oBilling.email);
                                order.get('billingInfo').trigger('billingContactUpdate');
                            }

                        });
                }
            },
            next: function () {
                this.stepStatus('complete');
                this.parent.get('billingInfo').calculateStepStatus();
            }
        }),

        CustomerBillingContact = CustomerModels.Contact.extend({
            hasRequiredBehavior: function(){
                 return true;
             }
         }),

        BillingInfo = CheckoutStep.extend({
            mozuType: 'payment',
            validation: {
                paymentType: {

                    fn: "validatePaymentType"
                },
                savedPaymentMethodId: {
                    fn: "validateSavedPaymentMethodId"
                },

                'billingContact.email': {
                    pattern: 'email',
                    msg: Hypr.getLabel('emailMissing')
                }
            },
            dataTypes: {
                'isSameBillingShippingAddress': Backbone.MozuModel.DataTypes.Boolean,
                'creditAmountToApply': Backbone.MozuModel.DataTypes.Float
            },
            relations: {
                billingContact: CustomerBillingContact,
                card: PaymentMethods.CreditCardWithCVV,
                check: PaymentMethods.Check,
                purchaseOrder: PaymentMethods.PurchaseOrder
            },
            validatePaymentType: function(value, attr) {
                var order = this.getOrder();
                var payment = order.apiModel.getCurrentPayment();
                var errorMessage = Hypr.getLabel('paymentTypeMissing');
                if (!value) return errorMessage;
                if ((value === "StoreCredit" || value === "GiftCard") && this.nonStoreCreditOrGiftCardTotal() > 0 && !payment) return errorMessage;
            },
            validateSavedPaymentMethodId: function (value, attr, computedState) {
                if (this.get('usingSavedCard')) {
                    var isValid = this.get('savedPaymentMethodId');
                    if (!isValid) return Hypr.getLabel('selectASavedCard');
                }

            },
            helpers: ['acceptsMarketing', 'savedPaymentMethods', 'availableStoreCredits', 'applyingCredit', 'maxCreditAmountToApply',
              'activeStoreCredits', 'activeGiftCards', 'nonStoreCreditOrGiftCardTotal', 'activePayments', 'hasSavedCardPayment', 'availableDigitalCredits', 'availableGiftCards', 'digitalCreditPaymentTotal', 'giftCardPaymentTotal', 'isAnonymousShopper', 'visaCheckoutFlowComplete','isExternalCheckoutFlowComplete', 'checkoutFlow'],
            acceptsMarketing: function () {
                return this.getOrder().get('acceptsMarketing');
            },
            isExternalCheckoutFlowComplete: function () {
                return this.get('paymentWorkflow') !== "Mozu" || this.get("paymentType") == "token";
            },
            visaCheckoutFlowComplete: function() {
                return this.get('paymentWorkflow') === 'VisaCheckout';
            },
            checkoutFlow: function () {
                return this.get('paymentWorkflow');
            },
            cancelExternalCheckout: function() {
                var self = this;
                var order = this.getOrder();
                var currentPayment = order.apiModel.getCurrentPayment();
                return order.apiVoidPayment(currentPayment.id).then(function() {
                    self.clear();
                    self.stepStatus('incomplete');
                    // need to re-enable purchase order information if purchase order is available.
                    self.setPurchaseOrderInfo();
                    // Set the defualt payment method for the customer.
                    self.setDefaultPaymentType(self);
                });
            },
            activePayments: function () {
                return this.getOrder().apiModel.getActivePayments();
            },
            hasSavedCardPayment: function() {
                var currentPayment = this.getOrder().apiModel.getCurrentPayment();
                return !!(currentPayment && currentPayment.billingInfo.card && currentPayment.billingInfo.card.paymentServiceCardId);
            },
            nonStoreCreditOrGiftCardTotal: function () {
                var me = this,
                    order = this.getOrder(),
                    total = order.get('total'),
                    result,
                    activeGiftCards = this.activeGiftCards(),
                    activeCredits = this.activeStoreCredits();

                    if (!activeGiftCards && !activeCredits) return total;

                    var giftCardTotal = _.reduce(activeGiftCards || [], function(sum, giftCard) {
                        return sum + giftCard.amountRequested;
                    }, 0);


                    var storeCreditTotal = _.reduce(activeCredits || [], function (sum, credit){
                        return sum + credit.amountRequested;
                    }, 0);

                    result = total - giftCardTotal - storeCreditTotal;
                    return me.roundToPlaces(result, 2);
            },
            resetAddressDefaults: function () {
                var billingAddress = this.get('billingContact').get('address');
                var addressDefaults = billingAddress.defaults;
                billingAddress.set('countryCode', addressDefaults.countryCode);
                billingAddress.set('addressType', addressDefaults.addressType);
                billingAddress.set('candidateValidatedAddresses', addressDefaults.candidateValidatedAddresses);
            },
            savedPaymentMethods: function () {
                var cards = this.getOrder().get('customer').get('cards').toJSON();
                return cards && cards.length > 0 && cards;
            },
            activeStoreCredits: function () {
                var active = this.getOrder().apiModel.getActiveStoreCredits();
                return active && active.length > 0 && active;
            },
            activeGiftCards: function() {
              var active = this.getOrder().apiModel.getActiveGiftCards();
              return active && active.length > 0 && active;
            },
            availableStoreCredits: function () {
                var order = this.getOrder(),
                    customer = order.get('customer'),
                    credits = customer && customer.get('credits'),
                    usedCredits = this.activeStoreCredits(),
                    availableCredits = credits && _.compact(_.map(credits.models, function (credit) {
                        if (!(credit.creditType === 'StoreCredit' || credit.creditType === 'GiftCard'))
                            return false;
                        credit = _.clone(credit);
                        if (usedCredits) _.each(usedCredits, function (uc) {
                            if (uc.billingInfo.storeCreditCode === credit.code) {
                                credit.currentBalance -= uc.amountRequested;
                            }
                        });
                        return credit.currentBalance > 0 ? credit : false;
                    }));
                return availableCredits && availableCredits.length > 0 && availableCredits;
            },

            applyingCredit: function () {
                return this._applyingCredit;
            },
            maxCreditAmountToApply: function () {
                var order = this.getOrder(),
                    total = order.get('amountRemainingForPayment'),
                    applyingCredit = this.applyingCredit();
                if (applyingCredit) return Math.min(applyingCredit.currentBalance, total).toFixed(2);
            },
            beginApplyCredit: function () {
                var selectedCredit = this.get('selectedCredit');
                this._oldPaymentType = this.get('paymentType');
                if (selectedCredit) {
                    var applyingCredit = _.findWhere(this.availableStoreCredits(), { code: selectedCredit });
                    if (applyingCredit) {
                        this._applyingCredit = applyingCredit;
                        this.set('creditAmountToApply', this.maxCreditAmountToApply());
                    }
                }
            },
            closeApplyCredit: function () {
                delete this._applyingCredit;
                this.unset('selectedCredit');
                this.set('paymentType', this._oldPaymentType);
            },
            finishApplyCredit: function () {
                var self = this,
                    order = self.getOrder();
                return order.apiAddStoreCredit({
                    storeCreditCode: this.get('selectedCredit'),
                    amount: this.get('creditAmountToApply')
                }).then(function (o) {
                    order.set(o.data);
                    self.closeApplyCredit();
                    return order.update();
                });
            },
            // digital

            onCreditAmountChanged: function(digCredit, amt) {
                this.applyDigitalCredit(digCredit.get('code'), amt);
            },

            loadCustomerDigitalCredits: function () {
                var self = this,
                    order = this.getOrder(),
                    customer = order.get('customer'),
                    activeCredits = this.activeStoreCredits();

                var customerCredits = customer.get('credits');
                if (customerCredits && customerCredits.length > 0) {
                    var currentDate = new Date(),
                        unexpiredDate = new Date(2076, 6, 4);

                    // todo: refactor so conversion & get can re-use - Greg Murray on 2014-07-01
                    var invalidCredits = customerCredits.filter(function(cred) {
                        var credBalance = cred.get('currentBalance'),
                            credExpDate = cred.get('expirationDate');
                        var expDate = (credExpDate) ? new Date(credExpDate) : unexpiredDate;
                        return (!credBalance || credBalance <= 0 || expDate < currentDate);
                    });
                    _.each(invalidCredits, function(inv) {
                        customerCredits.remove(inv);
                    });
                }
                self._cachedDigitalCredits = customerCredits;

                if (activeCredits) {
                    var userEnteredCredits = _.filter(activeCredits, function(activeCred) {
                        var existingCustomerCredit = self._cachedDigitalCredits.find(function(cred) {
                            return cred.get('code').toLowerCase() === activeCred.billingInfo.storeCreditCode.toLowerCase();
                        });
                        if (!existingCustomerCredit) {
                            return true;
                        }
                        //apply pricing update.
                        existingCustomerCredit.set('isEnabled', true);
                        existingCustomerCredit.set('creditAmountApplied', activeCred.amountRequested);
                        existingCustomerCredit.set('remainingBalance', existingCustomerCredit.calculateRemainingBalance());
                        return false;
                    });
                    if (userEnteredCredits) {
                        this.convertPaymentsToDigitalCredits(userEnteredCredits, customer);
                    }
                }

            },

            convertPaymentsToDigitalCredits: function(activeCredits, customer) {
                var me = this;
                _.each(activeCredits, function (activeCred) {
                    var currentCred = activeCred;
                    return me.retrieveDigitalCredit(customer, currentCred.billingInfo.storeCreditCode, me, currentCred.amountRequested).then(function(digCredit) {
                        me.trigger('orderPayment', me.getOrder().data, me);
                        return digCredit;
                    });
                });
            },

            availableDigitalCredits: function () {
                if (! this._cachedDigitalCredits) {
                    this.loadCustomerDigitalCredits();
                }
                return this._cachedDigitalCredits && this._cachedDigitalCredits.length > 0 && this._cachedDigitalCredits;
            },

            refreshBillingInfoAfterAddingStoreCredit: function (order, updatedOrder) {
                var self = this;
                //clearing existing order billing info because information may have been removed (payment info) #68583

                // #73389 only refresh if the payment requirement has changed after adding a store credit.
                var activePayments = this.activePayments();
                var hasNonStoreCreditPayment = (_.filter(activePayments, function (item) { return item.paymentType !== 'StoreCredit'; })).length > 0;
                if ((order.get('amountRemainingForPayment') >= 0 && !hasNonStoreCreditPayment) ||
                    (order.get('amountRemainingForPayment') < 0 && hasNonStoreCreditPayment)
                    ) {
                    order.get('billingInfo').clear();
                    order.set(updatedOrder, { silent: true });
                }
                self.setPurchaseOrderInfo();
                self.setDefaultPaymentType(self);
                self.trigger('orderPayment', updatedOrder, self);

            },

            applyDigitalCredit: function (creditCode, creditAmountToApply, isEnabled) {
                var self = this,
                    order = self.getOrder(),
                    maxCreditAvailable = null;

                this._oldPaymentType = this.get('paymentType');
                var digitalCredit = this._cachedDigitalCredits.filter(function(cred) {
                     return cred.get('code').toLowerCase() === creditCode.toLowerCase();
                });

                if (! digitalCredit || digitalCredit.length === 0) {
                    return self.deferredError(Hypr.getLabel('digitalCodeAlreadyUsed', creditCode), self);
                }
                digitalCredit = digitalCredit[0];
                var previousAmount = digitalCredit.get('creditAmountApplied');
                var previousEnabledState = digitalCredit.get('isEnabled');

                if (!creditAmountToApply && creditAmountToApply !== 0) {
                    creditAmountToApply = self.getMaxCreditToApply(digitalCredit, self);
                }

                digitalCredit.set('creditAmountApplied', creditAmountToApply);
                digitalCredit.set('remainingBalance',  digitalCredit.calculateRemainingBalance());
                digitalCredit.set('isEnabled', isEnabled);

                //need to round to prevent being over total by .01
                if (creditAmountToApply > 0) {
                    creditAmountToApply = self.roundToPlaces(creditAmountToApply, 2);
                }

                var activeCreditPayments = this.activeStoreCredits();
                if (activeCreditPayments) {
                    //check if payment applied with this code, remove
                    var sameCreditPayment = _.find(activeCreditPayments, function (cred) {
                        return cred.status !== 'Voided' && cred.billingInfo && cred.billingInfo.storeCreditCode.toLowerCase() === creditCode.toLowerCase();
                    });

                    if (sameCreditPayment) {
                        if (this.areNumbersEqual(sameCreditPayment.amountRequested, creditAmountToApply)) {
                            var deferredSameCredit = api.defer();
                            deferredSameCredit.reject();
                            return deferredSameCredit.promise;
                        }
                        if (creditAmountToApply === 0) {
                            return order.apiVoidPayment(sameCreditPayment.id).then(function(o) {
                                order.set(o.data);
                                self.setPurchaseOrderInfo();
                                self.setDefaultPaymentType(self);
                                self.trigger('orderPayment', o.data, self);
                                return o;
                            });
                        } else {
                            maxCreditAvailable = self.getMaxCreditToApply(digitalCredit, self, sameCreditPayment.amountRequested);
                            if (creditAmountToApply > maxCreditAvailable) {
                                digitalCredit.set('creditAmountApplied', previousAmount);
                                digitalCredit.set('isEnabled', previousEnabledState);
                                digitalCredit.set('remainingBalance', digitalCredit.calculateRemainingBalance());
                                return self.deferredError(Hypr.getLabel('digitalCreditExceedsBalance'), self);
                            }
                            return order.apiVoidPayment(sameCreditPayment.id).then(function (o) {
                                order.set(o.data);

                                return order.apiAddStoreCredit({
                                    storeCreditCode: creditCode,
                                    amount: creditAmountToApply
                                }).then(function (o) {
                                    self.refreshBillingInfoAfterAddingStoreCredit(order, o.data);
                                    return o;
                                });
                            });
                        }
                    }
                }
                if (creditAmountToApply === 0) {
                    return this.getOrder();
                }

                maxCreditAvailable = self.getMaxCreditToApply(digitalCredit, self);
                if (creditAmountToApply > maxCreditAvailable) {
                    digitalCredit.set('creditAmountApplied', previousAmount);
                    digitalCredit.set('remainingBalance', digitalCredit.calculateRemainingBalance());
                    digitalCredit.set('isEnabled', previousEnabledState);
                    return self.deferredError(Hypr.getLabel('digitalCreditExceedsBalance'), self);
                }

                return order.apiAddStoreCredit({
                    storeCreditCode: creditCode,
                    amount: creditAmountToApply,
                    email: self.get('billingContact').get('email')
                }).then(function (o) {
                    self.refreshBillingInfoAfterAddingStoreCredit(order, o.data);
                    return o;
                });
            },

            deferredError: function deferredError(msg, scope) {
                scope.trigger('error', {
                    message: msg
                });
                var deferred = api.defer();
                deferred.reject();

                return deferred.promise;
            },

            areNumbersEqual: function(f1, f2) {
                var epsilon = 0.01;
                return (Math.abs(f1 - f2)) < epsilon;
            },
            loadGiftCards: function(){
              //TODO: phase 2: get giftCards from customer account
              var me = this;
              var activeGiftCards = this.activeGiftCards();

              if (activeGiftCards) {
                var numberOfGiftCards = activeGiftCards.length;
                var counter = 0;
                activeGiftCards.forEach(function(giftCardPayment){
                    var newGiftCardModel = new PaymentMethods.GiftCard(giftCardPayment.billingInfo.card);
                      newGiftCardModel.apiGetBalance().then(function(res){
                          var balance = res.data.balance;
                          if (balance > 0){
                            newGiftCardModel.set('isEnabled', true);
                            newGiftCardModel.set('amountApplied', giftCardPayment.amountRequested);
                            newGiftCardModel.set('currentBalance', balance);
                            newGiftCardModel.set('remainingBalance', newGiftCardModel.calculateRemainingBalance());
                            me._cachedGiftCards.push(newGiftCardModel);
                          }
                          counter ++;
                          if (counter==numberOfGiftCards){
                              me.trigger('render');
                          }
                        }
                      );

                });
              }
            },
            applyGiftCard: function(giftCardId, amountToApply, isEnabled){
             var self = this, order = this.getOrder();
             //get gift card by id from _giftCardCache
             var giftCardModel = this._cachedGiftCards.find(function(giftCard){
                return giftCard.get('id') === giftCardId;
             });

             var previousAmount = giftCardModel.get('amountApplied');
             var previousEnabledState = giftCardModel.get('isEnabled');

             if (!amountToApply && amountToApply !== 0) {
                 amountToApply = self.getMaxCreditToApply(giftCardModel, self);
             }

             if (amountToApply > 0) {
                 amountToApply = self.roundToPlaces(amountToApply, 2);
             }

             var activeGiftCards = this.activeGiftCards();
             if (activeGiftCards) {
                 var sameGiftCard = _.find(activeGiftCards, function(giftCard){
                     return giftCard.status != 'Voided' && giftCard.billingInfo.card.paymentServiceCardId == giftCardId;
                 });

                 if (sameGiftCard){
                   if (this.areNumbersEqual(sameGiftCard.amountRequested, amountToApply)) {
                       var deferredSameGiftCard = api.defer();
                       deferredSameGiftCard.reject();
                       return deferredSameGiftCard.promise;
                   }
                   if (amountToApply === 0) {
                       return order.apiVoidPayment(sameGiftCard.id).then(function(o) {
                           order.set(o.data);
                           self.setPurchaseOrderInfo();
                           //self.setDefaultPaymentType(self);
                           // TODO: figure out if this is needed?
                           giftCardModel.set('amountApplied', amountToApply);
                           giftCardModel.set('isEnabled', isEnabled);
                           giftCardModel.set('remainingBalance', giftCardModel.calculateRemainingBalance());
                           self.trigger('orderPayment', o.data, self);
                           return o;
                       });
                   } else {
                       maxCreditAvailable = self.getMaxCreditToApply(giftCardModel, self, sameGiftCard.amountRequested);
                       if (amountToApply > maxCreditAvailable) {
                           giftCardModel.set('amountApplied', previousAmount);
                           giftCardModel.set('isEnabled', previousEnabledState);
                           giftCardModel.set('remainingBalance', giftCardModel.calculateRemainingBalance());
                           return self.deferredError(Hypr.getLabel('digitalCreditExceedsBalance'), self);
                       }
                       return order.apiVoidPayment(sameGiftCard.id).then(function (o) {
                           order.set(o.data);
                           giftCardModel.set('amountToApply', amountToApply);
                           return order.apiAddGiftCard(giftCardModel.toJSON()).then(function (o) {
                               giftCardModel.set('amountApplied', amountToApply);
                               giftCardModel.set('isEnabled', isEnabled);
                               giftCardModel.set('remainingBalance', giftCardModel.calculateRemainingBalance());
                               self.refreshBillingInfoAfterAddingStoreCredit(order, o.data);
                               return o;
                           });
                       });
                   }
               }
           }

           if (amountToApply === 0) {
               return this.getOrder();
           }

           var maxCreditAvailable = self.getMaxCreditToApply(giftCardModel, self);
           if (amountToApply > maxCreditAvailable) {
               giftCardModel.set('amountApplied', previousAmount);
               giftCardModel.set('remainingBalance', giftCardModel.calculateRemainingBalance());
               giftCardModel.set('isEnabled', previousEnabledState);
               return self.deferredError(Hypr.getLabel('digitalCreditExceedsBalance'), self);
           }

           giftCardModel.set('amountToApply', amountToApply);
           return order.apiAddGiftCard(giftCardModel.toJSON()).then(function(data){
               giftCardModel.set('amountApplied', amountToApply);
               giftCardModel.set('remainingBalance', giftCardModel.calculateRemainingBalance());
               giftCardModel.set('isEnabled', isEnabled);
               //TODO: see if giftCardModel is changed by syncApiModel
               //TODO: maybe update the order to represent the return from this?
               self.syncApiModel();
               self.trigger('render');
             }, function(error){
               self.trigger('error', {
                    message: error.message
               });
             });

           },
           retrieveGiftCard: function(number, securityCode) {
             var me = this;
             this.syncApiModel();
             var giftCardModel = new PaymentMethods.GiftCard( {cardNumber: number, cvv: securityCode, cardType: "GIFTCARD", isEnabled: true });
             me.isLoading(true);
             return giftCardModel.apiGetBalanceUnregistered().then(function(res){
                 if (!res.data.isSuccessful){
                     me.isLoading(false);
                     me.trigger('error', {
                         message: res.data.message
                     });
                     return;
                 }
                 var balance = res.data.balance;
                 if (balance>0){
                     return giftCardModel.apiSave().then(function(giftCard){
                         if (!giftCardModel.get('id')) giftCardModel.set('id', giftCardModel.get('paymentServiceCardId'));
                         giftCardModel.set('currentBalance', balance);
                         me._cachedGiftCards.push(giftCardModel.clone());
                         return me.applyGiftCard(giftCardModel.get('id'), null, true);
                     }, function(error){
                       //Error with apiSave.
                       me.trigger('error',{
                          message: Hypr.getLabel('giftCardPaymentServiceError')
                       });
                     });
                 } else {
                     me.isLoading(false);
                     // No balance error
                     me.trigger('error', {
                         message: Hypr.getLabel('giftCardNoBalance')
                     });
                 }
             }, function(error){
               me.isLoading(false);
               me.trigger('error', {
                    message: Hypr.getLabel('giftCardBalanceError')
               });
             });
            },
            getGatewayGiftCard: function() {
                var me = this,
                giftCardNumber = this.get('giftCardNumber'),
                giftCardSecurityCode = this.get('giftCardSecurityCode');

                //Our only option for checking if a card already exists, for now,
                //is to only compare the last 4 digits.
                var existingGiftCard = this._cachedGiftCards.filter(function (card) {
                    var cachedCardLast4 = card.get('cardNumber').slice(-4);
                    var newCardLast4 = giftCardNumber.slice(-4);
                    return cachedCardLast4 === newCardLast4;
                });

                if (existingGiftCard && existingGiftCard.length > 0) {
                    me.trigger('error', {
                        message: Hypr.getLabel('giftCardAlreadyAdded')
                    });
                    me.isLoading(false);
                    return me;
                } else {
                    return me.retrieveGiftCard(giftCardNumber, giftCardSecurityCode).ensure(function(res){
                      me.isLoading(false);
                      return me;
                    });
                }
            },
            availableGiftCards: function(){
              return this._cachedGiftCards && this._cachedGiftCards.length > 0 && this._cachedGiftCards;
            },
            retrieveDigitalCredit: function (customer, creditCode, me, amountRequested) {
                var self = this;
                return customer.apiGetDigitalCredit(creditCode).then(function (credit) {
                    var creditModel = new PaymentMethods.DigitalCredit(credit.data);
                    creditModel.set('isTiedToCustomer', false);

                    var validateCredit = function() {
                        var now = new Date(),
                            activationDate = creditModel.get('activationDate') ? new Date(creditModel.get('activationDate')) : null,
                            expDate = creditModel.get('expirationDate') ? new Date(creditModel.get('expirationDate')) : null;
                        if (expDate && expDate < now) {
                            return self.deferredError(Hypr.getLabel('digitalCreditExpired', expDate.toLocaleDateString()), self);
                        }
                        if (activationDate && activationDate > now) {
                            return self.deferredError(Hypr.getLabel('digitalCreditNotYetActive', activationDate.toLocaleDateString()), self);
                        }
                        if (!creditModel.get('currentBalance') || creditModel.get('currentBalance') <= 0) {
                            return self.deferredError(Hypr.getLabel('digitalCreditNoRemainingFunds'), self);
                        }
                        return null;
                    };

                    var validate = validateCredit();
                    if (validate !== null) {
                        return null;
                    }

                    var maxAmt = me.getMaxCreditToApply(creditModel, me, amountRequested);
                    if (!!amountRequested && amountRequested < maxAmt) {
                        maxAmt = amountRequested;
                    }
                    creditModel.set('creditAmountApplied', maxAmt);
                    creditModel.set('remainingBalance', creditModel.calculateRemainingBalance());
                    creditModel.set('isEnabled', true);

                    me._cachedDigitalCredits.push(creditModel);
                    me.applyDigitalCredit(creditCode, maxAmt, true);
                    me.trigger('sync', creditModel);
                    return creditModel;
                });
            },

            getDigitalCredit: function () {
                var me = this,
                    order = me.getOrder(),
                    customer = order.get('customer');
                var creditCode = this.get('digitalCreditCode');

                var existingDigitalCredit = this._cachedDigitalCredits.filter(function (cred) {
                    return cred.get('code').toLowerCase() === creditCode.toLowerCase();
                });
                if (existingDigitalCredit && existingDigitalCredit.length > 0){
                    me.trigger('error', {
                        message: Hypr.getLabel('digitalCodeAlreadyUsed', creditCode)
                    });
                    // to maintain promise api
                    var deferred = api.defer();
                    deferred.reject();
                    return deferred.promise;
                }
                me.isLoading(true);
                return me.retrieveDigitalCredit(customer, creditCode, me).then(function() {
                    me.isLoading(false);
                    return me;
                });
            },

            getMaxCreditToApply: function(creditModel, scope, toBeVoidedPayment) {
                var remainingTotal = scope.nonStoreCreditOrGiftCardTotal();
                if (!!toBeVoidedPayment) {
                    remainingTotal += toBeVoidedPayment;
                }
                var maxAmt = remainingTotal < creditModel.get('currentBalance') ? remainingTotal : creditModel.get('currentBalance');
                return scope.roundToPlaces(maxAmt, 2);
            },

            roundToPlaces: function(amt, numberOfDecimalPlaces) {
                var transmogrifier = Math.pow(10, numberOfDecimalPlaces);
                return Math.round(amt * transmogrifier) / transmogrifier;
            },

            digitalCreditPaymentTotal: function () {
                var activeCreditPayments = this.activeStoreCredits();
                if (!activeCreditPayments)
                    return null;
                return _.reduce(activeCreditPayments, function (sum, credit) {
                    return sum + credit.amountRequested;
                }, 0);
            },

            giftCardPaymentTotal: function () {
                var activeGiftCards = this.activeGiftCards();
                if (!activeGiftCards)
                    return null;
                return _.reduce(activeGiftCards, function (sum, giftcard) {
                    return sum + giftcard.amountRequested;
                }, 0);
            },

            addRemainingCreditToCustomerAccount: function(creditCode, isEnabled) {
                var self = this;

                var digitalCredit = self._cachedDigitalCredits.find(function(credit) {
                    return credit.code.toLowerCase() === creditCode.toLowerCase();
                });

                if (!digitalCredit) {
                    return self.deferredError(Hypr.getLabel('genericNotFound'), self);
                }
                digitalCredit.set('addRemainderToCustomer', isEnabled);
                return digitalCredit;
            },

            getDigitalCreditsToAddToCustomerAccount: function() {
                return this._cachedDigitalCredits.where({ isEnabled: true, addRemainderToCustomer: true, isTiedToCustomer: false });
            },

            isAnonymousShopper: function() {
                var order = this.getOrder(),
                    customer = order.get('customer');
                return (!customer || !customer.id || customer.id <= 1);
            },

            removeCredit: function(id) {
                var order = this.getOrder();
                return order.apiVoidPayment(id).then(order.update);
            },
            syncPaymentMethod: function (me, newId) {
                if (!newId || newId === 'new') {
                    me.get('billingContact').clear();
                    me.get('card').clear();
                    me.get('check').clear();
                    me.unset('paymentType');
                    me.set('usingSavedCard', false);
                } else {
                    me.setSavedPaymentMethod(newId);
                    me.set('usingSavedCard', true);
                }
            },
            setSavedPaymentMethod: function (newId, manualCard) {
                var me = this,
                    customer = me.getOrder().get('customer'),
                    card = manualCard || customer.get('cards').get(newId),
                    cardBillingContact = card && customer.get('contacts').get(card.get('contactId'));
                if (card) {
                    me.get('billingContact').set(cardBillingContact.toJSON(), { silent: true });
                    me.get('card').set(card.toJSON());
                    me.set('paymentType', 'CreditCard');
                    me.set('usingSavedCard', true);
                    if (Hypr.getThemeSetting('isCvvSuppressed')) {
                        me.get('card').set('isCvvOptional', true);
                        if (me.parent.get('amountRemainingForPayment') > 0) {
                            return me.applyPayment();
                        }
                    }
                }
            },
            getPaymentTypeFromCurrentPayment: function () {
                var billingInfoPaymentType = this.get('paymentType'),
                    billingInfoPaymentWorkflow = this.get('paymentWorkflow'),
                    currentPayment = this.getOrder().apiModel.getCurrentPayment(),
                    currentPaymentType = currentPayment && currentPayment.billingInfo.paymentType,
                    currentPaymentWorkflow = currentPayment && currentPayment.billingInfo.paymentWorkflow,
                    currentBillingContact = currentPayment && currentPayment.billingInfo.billingContact,
                    currentCard = currentPayment && currentPayment.billingInfo.card,
                    currentPurchaseOrder = currentPayment && currentPayment.billingInfo.purchaseorder,
                    purchaseOrderSiteSettings = HyprLiveContext.locals.siteContext.checkoutSettings.purchaseOrder ?
                        HyprLiveContext.locals.siteContext.checkoutSettings.purchaseOrder.isEnabled : false,
                    purchaseOrderCustomerSettings = this.getOrder().get('customer').get('purchaseOrder') ?
                        this.getOrder().get('customer').get('purchaseOrder').isEnabled : false;

                if(purchaseOrderSiteSettings && purchaseOrderCustomerSettings && !currentPayment) {
                    currentPaymentType = 'PurchaseOrder';
                }

                if (currentPaymentType && (currentPaymentType !== billingInfoPaymentType || currentPaymentWorkflow !== billingInfoPaymentWorkflow)) {
                    this.set('paymentType', currentPaymentType, { silent: true });
                    this.set('paymentWorkflow', currentPaymentWorkflow, { silent: true });
                    this.set('card', currentCard, { silent: true });
                    this.set('billingContact', currentBillingContact, { silent: true });
                    this.set('purchaseOrder', currentPurchaseOrder, { silent: true });
                }
            },
            edit: function () {
                this.getPaymentTypeFromCurrentPayment();
                CheckoutStep.prototype.edit.apply(this, arguments);
            },
            updatePurchaseOrderAmount: function() {

                var me = this,
                    order = me.getOrder(),
                    currentPurchaseOrder = this.get('purchaseOrder'),
                    pOAvailableBalance = currentPurchaseOrder.get('totalAvailableBalance'),
                    orderAmountRemaining = order.get('amountRemainingForPayment'),
                    amount = pOAvailableBalance > orderAmountRemaining ?
                        orderAmountRemaining : pOAvailableBalance;

                if((!this.get('purchaseOrder').get('isEnabled') && this.get('purchaseOrder').selected) || order.get('payments').length > 0) {
                    return;
                }


                currentPurchaseOrder.set('amount', amount);
                if(amount < orderAmountRemaining) {
                    currentPurchaseOrder.set('splitPayment', true);
                }

                //refresh ui when split payment is working?
                me.trigger('stepstatuschange'); // trigger a rerender
            },
            isPurchaseOrderEnabled: function() {
                var me = this,
                    order = me.getOrder(),
                    purchaseOrderInfo = order ?  order.get('customer').get('purchaseOrder') : null,
                    purchaseOrderSiteSettings = HyprLiveContext.locals.siteContext.checkoutSettings.purchaseOrder ?
                        HyprLiveContext.locals.siteContext.checkoutSettings.purchaseOrder.isEnabled : false,
                    purchaseOrderCustomerEnabled = purchaseOrderInfo ? purchaseOrderInfo.isEnabled : false,
                    customerAvailableBalance = purchaseOrderCustomerEnabled ? purchaseOrderInfo.totalAvailableBalance > 0 : false,
                    purchaseOrderEnabled = purchaseOrderSiteSettings && purchaseOrderCustomerEnabled && customerAvailableBalance;

                return purchaseOrderEnabled;
            },
            resetPOInfo: function() {
                var me = this,
                    currentPurchaseOrder = me.get('purchaseOrder');

                currentPurchaseOrder.get('paymentTermOptions').reset();
                currentPurchaseOrder.get('customFields').reset();
                currentPurchaseOrder.get('paymentTerm').clear();

                this.setPurchaseOrderInfo();
            },
            setPurchaseOrderInfo: function() {
                var me = this,
                    order = me.getOrder(),
                    purchaseOrderInfo = order ? order.get('customer').get('purchaseOrder') : null,
                    purchaseOrderEnabled = this.isPurchaseOrderEnabled(),
                    currentPurchaseOrder = me.get('purchaseOrder'),
                    siteId = require.mozuData('checkout').siteId,
                    currentPurchaseOrderAmount = currentPurchaseOrder.get('amount');

                currentPurchaseOrder.set('isEnabled', purchaseOrderEnabled);
                if(!purchaseOrderEnabled) {
                    // if purchase order isn't enabled, don't populate stuff!
                    return;
                }

                // Breaks the custom field array into individual items, and makes the value
                //  field a first class item against the purchase order model. Also populates the field if the
                //  custom field has a value.
                currentPurchaseOrder.deflateCustomFields();
                // Update models-checkout validation with flat purchaseOrderCustom fields for validation.
                for(var validateField in currentPurchaseOrder.validation) {
                    if(!this.validation['purchaseOrder.'+validateField]) {
                        this.validation['purchaseOrder.'+validateField] = currentPurchaseOrder.validation[validateField];
                    }
                    // Is this level needed?
                    if(!this.parent.validation['billingInfo.purchaseOrder.'+validateField]) {
                        this.parent.validation['billingInfo.purchaseOrder.'+validateField] =
                            currentPurchaseOrder.validation[validateField];
                    }
                }

                // Set information, only if the current purchase order does not have it:
                var amount = purchaseOrderInfo.totalAvailableBalance > order.get('amountRemainingForPayment') ?
                        order.get('amountRemainingForPayment') : purchaseOrderInfo.totalAvailableBalance;

                currentPurchaseOrder.set('amount', amount);

                currentPurchaseOrder.set('totalAvailableBalance', purchaseOrderInfo.totalAvailableBalance);
                currentPurchaseOrder.set('availableBalance', purchaseOrderInfo.availableBalance);
                currentPurchaseOrder.set('creditLimit', purchaseOrderInfo.creditLimit);

                if(purchaseOrderInfo.totalAvailableBalance < order.get('amountRemainingForPayment')) {
                    currentPurchaseOrder.set('splitPayment', true);
                }

                var paymentTerms = [];
                purchaseOrderInfo.paymentTerms.forEach(function(term) {
                    if(term.siteId === siteId) {
                        var newTerm = {};
                        newTerm.code = term.code;
                        newTerm.description = term.description;
                        paymentTerms.push(term);
                    }
                });
                currentPurchaseOrder.set('paymentTermOptions', paymentTerms, {silent: true});

                var paymentTermOptions = currentPurchaseOrder.get('paymentTermOptions');
                if(paymentTermOptions.length === 1) {
                    var paymentTerm = {};
                    paymentTerm.code = paymentTermOptions.models[0].get('code');
                    paymentTerm.description = paymentTermOptions.models[0].get('description');
                    currentPurchaseOrder.set('paymentTerm', paymentTerm);
                }

                this.setPurchaseOrderBillingInfo();
            },
            setPurchaseOrderBillingInfo: function() {
                var me = this,
                    order = me.getOrder(),
                    purchaseOrderEnabled = this.isPurchaseOrderEnabled(),
                    currentPurchaseOrder = me.get('purchaseOrder'),
                    contacts = order ? order.get('customer').get('contacts') : null;
                if(purchaseOrderEnabled) {
                    if(currentPurchaseOrder.selected && contacts.length > 0) {
                        var foundBillingContact = contacts.models.find(function(item){
                            return item.get('isPrimaryBillingContact');

                        });

                        if(foundBillingContact) {
                            this.set('billingContact', foundBillingContact, {silent: true});
                            currentPurchaseOrder.set('usingBillingContact', true);
                        }
                    }
                }
            },
            setPurchaseOrderPaymentTerm: function(termCode) {
                var currentPurchaseOrder = this.get('purchaseOrder'),
                    paymentTermOptions = currentPurchaseOrder.get('paymentTermOptions');
                    var foundTerm = paymentTermOptions.find(function(term) {
                        return term.get('code') === termCode;
                    });
                    currentPurchaseOrder.set('paymentTerm', foundTerm, {silent: true});
            },
            initialize: function () {
                var me = this;
                this._cachedGiftCards = [];
                _.defer(function () {

                    //set purchaseOrder defaults here.
                    me.setPurchaseOrderInfo();
                    me.getPaymentTypeFromCurrentPayment();

                    var savedCardId = me.get('card.paymentServiceCardId');
                    me.set('savedPaymentMethodId', savedCardId, { silent: true });
                    me.setSavedPaymentMethod(savedCardId);

                    if (!savedCardId) {
                        me.setDefaultPaymentType(me);
                    }

                    me.on('change:usingSavedCard', function (me, yes) {
                        if (!yes) {
                            me.get('card').clear();
                            me.set('usingSavedCard', false);
                        }
                        else {
                            me.set('isSameBillingShippingAddress', false);
                            me.setSavedPaymentMethod(me.get('savedPaymentMethodId'));
                        }
                    });
                    me.loadGiftCards();
                });
                var billingContact = this.get('billingContact');
                this.on('change:paymentType', this.selectPaymentType);
                this.selectPaymentType(this, this.get('paymentType'));
                this.on('change:isSameBillingShippingAddress', function (model, wellIsIt) {
                    if (wellIsIt) {
                        var oBilling = billingContact.toJSON();
                        billingContact.set(this.parent.get('fulfillmentInfo').get('fulfillmentContact').toJSON(), { silent: true });
                        billingContact.set('email', oBilling.email,{ silent: true });
                    } else if (billingContact) {
                        // if they initially checked the checkbox, then later they decided to uncheck it... remove the id so that updates don't update
                        // the original address, instead create a new contact address.
                        // We also unset contactId to prevent id from getting reset later.
                        billingContact.unset('id', { silent: true });
                        billingContact.unset('contactId', { silent: true });
                    }
                });
                this.on('change:savedPaymentMethodId', this.syncPaymentMethod);
                this._cachedDigitalCredits = null;

                _.bindAll(this, 'applyPayment', 'markComplete');
            },
            selectPaymentType: function(me, newPaymentType) {
                if ((!me.changed || !me.changed.paymentWorkflow) && !me.get('paymentWorkflow')) {
                    me.set('paymentWorkflow', 'Mozu');
                }
                me.get('check').selected = newPaymentType === 'Check';
                me.get('card').selected = newPaymentType === 'CreditCard';
                me.get('purchaseOrder').selected = newPaymentType === 'PurchaseOrder';
                if(newPaymentType === 'PurchaseOrder') {
                    me.setPurchaseOrderBillingInfo();
                }
            },
            setDefaultPaymentType: function(me) {
                if(me.isPurchaseOrderEnabled()) {
                    me.set('paymentType', 'PurchaseOrder');
                    me.selectPaymentType(me, 'PurchaseOrder');
                } else if(!me.get('paymentType', 'check')) {

                    me.set('paymentType', 'CreditCard');
                    me.selectPaymentType(me, 'CreditCard');
                    if (me.savedPaymentMethods() && me.savedPaymentMethods().length > 0) {
                        me.set('usingSavedCard', true);
                    }
                }
            },
            calculateStepStatus: function () {
                var fulfillmentComplete = this.parent.get('fulfillmentInfo').stepStatus() === 'complete',
                    activePayments = this.activePayments(),
                    thereAreActivePayments = activePayments.length > 0,
                    paymentTypeIsCard = activePayments && !!_.findWhere(activePayments, { paymentType: 'CreditCard' }),
                    balanceNotPositive = this.parent.get('amountRemainingForPayment') <= 0;

                if (paymentTypeIsCard && !Hypr.getThemeSetting('isCvvSuppressed')) return this.stepStatus('incomplete'); // initial state for CVV entry

                if (!fulfillmentComplete) return this.stepStatus('new');

                if (thereAreActivePayments && (balanceNotPositive || (this.get('paymentType') === 'PaypalExpress' && window.location.href.indexOf('PaypalExpress=complete') !== -1))) return this.stepStatus('complete');
                return this.stepStatus('incomplete');

            },
            hasPaymentChanged: function(payment) {

                // fix this for purchase orders, currently it constantly voids, then re-applys the payment even if nothing changes.
                function normalizeBillingInfos(obj) {
                    return {
                        paymentType: obj.paymentType,
                        billingContact: _.extend(_.pick(obj.billingContact,
                            'email',
                            'firstName',
                            'lastNameOrSurname',
                            'phoneNumbers'),
                        {
                            address: obj.billingContact.address ? _.pick(obj.billingContact.address,
                                'address1',
                                'address2',
                                'addressType',
                                'cityOrTown',
                                'countryCode',
                                'postalOrZipCode',
                                'stateOrProvince') : {}
                        }),
                        card: obj.card ? _.extend(_.pick(obj.card,
                            'expireMonth',
                            'expireYear',
                            'nameOnCard',
                            'isSavedCardInfo'),
                        {
                            cardType: obj.card.paymentOrCardType || obj.card.cardType,
                            cardNumber: obj.card.cardNumberPartOrMask || obj.card.cardNumberPart || obj.card.cardNumber,
                            id: obj.card.paymentServiceCardId || obj.card.id,
                            isCardInfoSaved: obj.card.isCardInfoSaved || false
                        }) : {},
                        purchaseOrder: obj.purchaseOrder || {},
                        check: obj.check || {}
                    };
                }

                var normalizedSavedPaymentInfo = normalizeBillingInfos(payment.billingInfo);
                var normalizedLiveBillingInfo = normalizeBillingInfos(this.toJSON());

                if (payment.paymentWorkflow === 'VisaCheckout') {
                    normalizedLiveBillingInfo.billingContact.address.addressType = normalizedSavedPaymentInfo.billingContact.address.addressType;
                }

                return !_.isEqual(normalizedSavedPaymentInfo, normalizedLiveBillingInfo);
            },
            submit: function () {

                var order = this.getOrder();
                // just can't sync these emails right
                order.ensureEmailIsSet();

                // This needs to be ahead of validation so we can check if visa checkout is being used.
                var currentPayment = order.apiModel.getCurrentPayment();

                // the card needs to know if this is a saved card or not.
                this.get('card').set('isSavedCard', order.get('billingInfo.usingSavedCard'));
                // the card needs to know if this is Visa checkout (or Amazon? TBD)
                if (currentPayment) {
                    this.get('card').set('isVisaCheckout', currentPayment.paymentWorkflow.toLowerCase() === 'visacheckout');
                }

                var val = this.validate();

                if (this.nonStoreCreditOrGiftCardTotal() > 0 && val) {
                    // display errors:
                    /*
                    var error = {"items":[]};
                    for (var key in val) {
                        if (val.hasOwnProperty(key)) {
                            var errorItem = {};
                            errorItem.name = key;
                            errorItem.message = key.substring(0, ".") + val[key];
                            error.items.push(errorItem);
                        }
                    }
                    if (error.items.length > 0) {
                        order.onCheckoutError(error);
                    }
                    */
                    return false;
                }

                var card = this.get('card');
                if(this.get('paymentType').toLowerCase() === "purchaseorder") {
                    this.get('purchaseOrder').inflateCustomFields();
                }

                if (!currentPayment) {
                    return this.applyPayment();
                } else if (this.hasPaymentChanged(currentPayment)) {
                    return order.apiVoidPayment(currentPayment.id).then(this.applyPayment);
                } else if (card.get('cvv') && card.get('paymentServiceCardId')) {
                    return card.apiSave().then(this.markComplete, order.onCheckoutError);
                } else {
                    this.markComplete();
                }
            },
            applyPayment: function () {
                var self = this, order = this.getOrder();
                if (this.get("paymentWorkflow") == "PayWithAmazon")
                    this.unset("paymentWorkflow");

                this.syncApiModel();
                if (this.nonStoreCreditOrGiftCardTotal() > 0) {
                    return order.apiAddPayment().then(function() {
                        var payment = order.apiModel.getCurrentPayment();
                        var modelCard, modelCvv;
                        var activePayments = order.apiModel.getActivePayments();
                        var creditCardPayment = activePayments && _.findWhere(activePayments, { paymentType: 'CreditCard' });
                        //Clear card if no credit card payments exists
                        if (!creditCardPayment && self.get('card')) {
                            self.get('card').clear();
                        }
                        if (payment) {
                            switch (payment.paymentType) {
                                case 'CreditCard':
                                    modelCard = self.get('card');
                                    modelCvv = modelCard.get('cvv');
                                    if (
                                        modelCvv && modelCvv.indexOf('*') === -1 // CVV exists and is not masked
                                    ) {
                                        modelCard.set('cvv', '***');
                                        // to hide CVV once it has been sent to the paymentservice
                                    }

                                    self.markComplete();
                                    break;
                                default:
                                    self.markComplete();
                            }
                        }
                    });
                } else {
                    this.markComplete();
                }
            },

            markComplete: function () {
                this.stepStatus('complete');
                this.isLoading(false);
                var order = this.getOrder();
                _.defer(function() {
                    order.isReady(true);
                });
            },
            toJSON: function(options) {
                var j = CheckoutStep.prototype.toJSON.apply(this, arguments), loggedInEmail;
                if (this.nonStoreCreditOrGiftCardTotal() === 0 && j.billingContact) {
                    delete j.billingContact.address;
                }
                if (j.billingContact && !j.billingContact.email) {
                    j.billingContact.email = this.getOrder().get('customer.emailAddress');
                }
                return j;
            }
        });

        var ShopperNotes = Backbone.MozuModel.extend(),

        checkoutPageValidation = {
            'emailAddress': {
                fn: function (value) {
                    if (this.attributes.createAccount && (!value || !value.match(Backbone.Validation.patterns.email))) return Hypr.getLabel('emailMissing');
                }
            },
            'password': {
                fn: function (value) {
                    if (this.attributes.createAccount && !value) return Hypr.getLabel('passwordMissing');
                }
            },
            'confirmPassword': {
                fn: function (value) {
                    if (this.attributes.createAccount && value !== this.get('password')) return Hypr.getLabel('passwordsDoNotMatch');
                }
            }
        };

        if (Hypr.getThemeSetting('requireCheckoutAgreeToTerms')) {
            checkoutPageValidation.agreeToTerms = {
                acceptance: true,
                msg: Hypr.getLabel('didNotAgreeToTerms')
            };
        }

        var storefrontOrderAttributes = require.mozuData('pagecontext').storefrontOrderAttributes;
        if(storefrontOrderAttributes && storefrontOrderAttributes.length > 0){

            var requiredAttributes = _.filter(storefrontOrderAttributes,
                function(attr) { return attr.isRequired && attr.isVisible && attr.valueType !== 'AdminEntered' ;  });
            requiredAttributes.forEach(function(attr) {
                if(attr.isRequired) {

                    checkoutPageValidation['orderAttribute-' + attr.attributeFQN] =
                    {
                        required: true,
                        msg: attr.content.value + " " + Hypr.getLabel('missing')
                    };
                }
            }, this);
        }

        var CheckoutPage = Backbone.MozuModel.extend({
            mozuType: 'order',
            handlesMessages: true,
            requiredBehaviors: [1002],
            relations: {
                fulfillmentInfo: FulfillmentInfo,
                billingInfo: BillingInfo,
                shopperNotes: ShopperNotes,
                customer: CustomerModels.Customer
            },
            validation: checkoutPageValidation,
            dataTypes: {
                createAccount: Backbone.MozuModel.DataTypes.Boolean,
                acceptsMarketing: Backbone.MozuModel.DataTypes.Boolean,
                amountRemainingForPayment: Backbone.MozuModel.DataTypes.Float
            },
            initialize: function (data) {

                var self = this,
                    user = require.mozuData('user');

                _.defer(function() {

                    var latestPayment = self.apiModel.getCurrentPayment(),
                        activePayments = self.apiModel.getActivePayments(),
                        fulfillmentInfo = self.get('fulfillmentInfo'),
                        fulfillmentContact = fulfillmentInfo.get('fulfillmentContact'),
                        billingInfo = self.get('billingInfo'),
                        steps = [fulfillmentInfo, fulfillmentContact, billingInfo],
                        paymentWorkflow = latestPayment && latestPayment.paymentWorkflow,
                        visaCheckoutPayment = activePayments && _.findWhere(activePayments, { paymentWorkflow: 'VisaCheckout' }),
                        allStepsComplete = function () {
                            return _.reduce(steps, function(m, i) { return m + i.stepStatus(); }, '') === 'completecompletecomplete';
                        },
                        isReady = allStepsComplete();

                    //Visa checkout payments can be added to order without UIs knowledge. This evaluates and voids the required payments.
                    if (visaCheckoutPayment) {
                        _.each(_.filter(self.apiModel.getActivePayments(), function (payment) {
                            return payment.paymentType !== 'StoreCredit' && payment.paymentType !== 'GiftCard' && payment.paymentWorkflow != 'VisaCheckout';
                        }), function (payment) {
                            self.apiVoidPayment(payment.id);
                        });
                        paymentWorkflow = visaCheckoutPayment.paymentWorkflow;
                        billingInfo.unset('billingContact');
                        billingInfo.set('card', visaCheckoutPayment.billingInfo.card);
                        billingInfo.set('billingContact', visaCheckoutPayment.billingInfo.billingContact, { silent:true });
                     }

                    if (paymentWorkflow) {
                        billingInfo.set('paymentWorkflow', paymentWorkflow);
                        billingInfo.get('card').set({
                            isCvvOptional: Hypr.getThemeSetting('isCvvSuppressed'),
                            paymentWorkflow: paymentWorkflow
                        });
                        billingInfo.trigger('stepstatuschange'); // trigger a rerender
                    }

                    self.isReady(isReady);

                    _.each(steps, function(step) {
                        self.listenTo(step, 'stepstatuschange', function() {
                            _.defer(function() {
                                self.isReady(allStepsComplete());
                            });
                        });
                    });

                    if (!self.get('requiresFulfillmentInfo')) {
                        self.validation = _.pick(self.constructor.prototype.validation, _.filter(_.keys(self.constructor.prototype.validation), function(k) { return k.indexOf('fulfillment') === -1; }));
                    }

                    var billingEmail = billingInfo.get('billingContact.email');

                    self.get('billingInfo.billingContact').on('change:email', function(model, newVal) {
                        self.set('email', newVal);
                    });

                    if (!billingEmail && user.email) billingInfo.set('billingContact.email', user.email);

                    self.applyAttributes();

                });
                if (user.isAuthenticated) {
                    this.set('customer', { id: user.accountId });
                }
                // preloaded JSON has this as null if it's unset, which defeats the defaults collection in backbone
                if (data.acceptsMarketing === null) {
                    self.set('acceptsMarketing', true);
                }

                _.bindAll(this, 'update', 'onCheckoutSuccess', 'onCheckoutError', 'addNewCustomer', 'saveCustomerCard', 'apiCheckout',
                    'addDigitalCreditToCustomerAccount', 'addCustomerContact', 'addBillingContact', 'addShippingContact', 'addShippingAndBillingContact');

            },

            applyAttributes: function() {
                var storefrontOrderAttributes = require.mozuData('pagecontext').storefrontOrderAttributes;
                if(storefrontOrderAttributes && storefrontOrderAttributes.length > 0) {
                    this.set('orderAttributes', storefrontOrderAttributes);
                }
            },

            processDigitalWallet: function(digitalWalletType, payment) {
                var me = this;
                me.runForAllSteps(function() {
                    this.isLoading(true);
                });
                me.trigger('beforerefresh');
                // void active payments; if there are none then the promise will resolve immediately
                return api.all.apply(api, _.map(_.filter(me.apiModel.getActivePayments(), function(payment) {
                    return payment.paymentType !== 'StoreCredit' && payment.paymentType !== 'GiftCard';
                }), function(payment) {
                    return me.apiVoidPayment(payment.id);
                })).then(function() {
                    return me.apiProcessDigitalWallet({
                        digitalWalletData: JSON.stringify(payment)
                    }).then(function () {
                        me.updateVisaCheckoutBillingInfo();
                        me.runForAllSteps(function() {
                            this.trigger('sync');
                            this.isLoading(false);
                        });
                        me.updateShippingInfo();
                    });
                });
            },
            updateShippingInfo: function() {
                var me = this;
                this.apiModel.getShippingMethods().then(function (methods) {
                    me.get('fulfillmentInfo').refreshShippingMethods(methods);
                });
            },
            updateVisaCheckoutBillingInfo: function() {
                //Update the billing info with visa checkout payment
                var billingInfo = this.get('billingInfo');
                var activePayments = this.apiModel.getActivePayments();
                var visaCheckoutPayment = activePayments && _.findWhere(activePayments, { paymentWorkflow: 'VisaCheckout' });
                if (visaCheckoutPayment) {
                    billingInfo.set('usingSavedCard', false);
                    billingInfo.unset('savedPaymentMethodId');
                    billingInfo.set('card', visaCheckoutPayment.billingInfo.card);
                    billingInfo.unset('billingContact');
                    billingInfo.set('billingContact', visaCheckoutPayment.billingInfo.billingContact, { silent:true });
                    billingInfo.set('paymentWorkflow', visaCheckoutPayment.paymentWorkflow);
                    billingInfo.set('paymentType', visaCheckoutPayment.paymentType);
                    this.refresh();
                }
            },
            addCoupon: function () {
                var me = this;
                var code = this.get('couponCode');
                var orderDiscounts = me.get('orderDiscounts');
                if (orderDiscounts && _.findWhere(orderDiscounts, { couponCode: code })) {
                    // to maintain promise api
                    var deferred = api.defer();
                    deferred.reject();
                    deferred.promise.otherwise(function () {
                        me.trigger('error', {
                            message: Hypr.getLabel('promoCodeAlreadyUsed', code)
                        });
                    });
                    return deferred.promise;
                }
                this.isLoading(true);
                return this.apiAddCoupon(this.get('couponCode')).then(function () {

                    me.get('billingInfo').trigger('sync');
                    me.set('couponCode', '');

                    var autoAddSuggestedDiscount = me.get('suggestedDiscounts').some(function(discount){
                      return discount.autoAdd;
                    });
                    if (me.get('suggestedDiscounts').length && autoAddSuggestedDiscount){
                      window.location =  (HyprLiveContext.locals.siteContext.siteSubdirectory||'') + "/cart";
                    }

                    var productDiscounts = _.flatten(_.pluck(me.get('items'), 'productDiscounts'));
                    var shippingDiscounts = _.flatten(_.pluck(_.flatten(_.pluck(me.get('items'), 'shippingDiscounts')), 'discount'));
                    var orderShippingDiscounts = _.flatten(_.pluck(me.get('shippingDiscounts'), 'discount'));

                    var allDiscounts = me.get('orderDiscounts').concat(productDiscounts).concat(shippingDiscounts).concat(orderShippingDiscounts);
                    var lowerCode = code.toLowerCase();

                    var matchesCode = function (d) {
                        // there are discounts that have no coupon code that we should not blow up on.
                        return (d.couponCode || "").toLowerCase() === lowerCode;
                    };

                    if (!allDiscounts || !_.find(allDiscounts, matchesCode))
                    {
                        me.trigger('error', {
                            message: Hypr.getLabel('promoCodeError', code)
                        });
                    }

                    else if (me.get('total') === 0) {

                        me.trigger('complete');
                    }
                    // only do this when there isn't a payment on the order...
                    me.get('billingInfo').updatePurchaseOrderAmount();
                    me.isLoading(false);
                });
            },
            onCheckoutSuccess: function () {
                this.isLoading(true);
                this.trigger('complete');
            },
            onCheckoutError: function (error) {
                var order = this,
                    errorHandled = false;
                order.isLoading(false);
                if (!error || !error.items || error.items.length === 0) {
                    if (error.message.indexOf('10486') != -1){

                        var siteContext = HyprLiveContext.locals.siteContext,
                            externalPayment = _.findWhere(siteContext.checkoutSettings.externalPaymentWorkflowSettings, {"name" : "PayPalExpress2"}),
                            environment = _.findWhere(externalPayment.credentials, {"apiName" : "environment"}),
                            url = "";

                        if (environment.value.toLowerCase() === "sandbox"){
                            url = "https://www.sandbox.paypal.com";
                        }
                        else{
                            url = "https://www.paypal.com";
                        }

                        var paypalPayments = _.filter(order.get("payments"),function(payment) { return payment.paymentType == "PayPalExpress2";});
                        paypalPayments = _.sortBy(paypalPayments, function(payment) {return payment.auditInfo.updateDate;}).reverse();

                        window.location.href = url + "/cgi-bin/webscr?cmd=_express-checkout&token=" + paypalPayments[0].externalTransactionId;

                        return;
                    }
                    else {
                        error = {
                            items: [
                                {
                                    message: error.message || Hypr.getLabel('unknownError')
                                }
                            ]
                        };
                    }
                }
                $.each(error.items, function (ix, errorItem) {
                    if (errorItem.name === 'ADD_CUSTOMER_FAILED' && errorItem.message.toLowerCase().indexOf('invalid parameter: password')) {
                        errorHandled = true;
                        order.trigger('passwordinvalid', errorItem.message.substring(errorItem.message.indexOf('Password')));
                    }
                    if (errorItem.errorCode === 'ADD_CUSTOMER_FAILED' && errorItem.message.toLowerCase().indexOf('invalid parameter: emailaddress')) {
                        errorHandled = true;
                        order.trigger('userexists', order.get('emailAddress'));
                    }
                });

                this.trigger('error', error);

                if (!errorHandled) order.messages.reset(error.items);
                order.isSubmitting = false;
                throw error;
            },
            addNewCustomer: function () {
                var self = this,
                billingInfo = this.get('billingInfo'),
                billingContact = billingInfo.get('billingContact'),
                email = this.get('emailAddress'),
                captureCustomer = function (customer) {
                    if (!customer || (customer.type !== 'customer' && customer.type !== 'login')) return;
                    var newCustomer;
                    if (customer.type === 'customer') newCustomer = customer.data;
                    if (customer.type === 'login') newCustomer = customer.data.customerAccount;
                    if (newCustomer && newCustomer.id) {
                        self.set('customer', newCustomer);
                        api.off('sync', captureCustomer);
                        api.off('spawn', captureCustomer);
                    }
                };
                api.on('sync', captureCustomer);
                api.on('spawn', captureCustomer);
                return this.apiAddNewCustomer({
                    account: {
                        emailAddress: email,
                        userName: email,
                        firstName: billingContact.get('firstName') || this.get('fulfillmentInfo.fulfillmentContact.firstName'),
                        lastName: billingContact.get('lastNameOrSurname') || this.get('fulfillmentInfo.fulfillmentContact.lastNameOrSurname'),
                        acceptsMarketing: self.get('acceptsMarketing')
                    },
                    password: this.get('password')
                }).then(function (customer) {
                    self.customerCreated = true;
                    return customer;
                }, function (error) {
                    self.customerCreated = false;
                    self.isSubmitting = false;
                    throw error;
                });
            },
            addBillingContact: function () {
                return this.addCustomerContact('billingInfo', 'billingContact', [{ name: 'Billing' }]);
            },
            addShippingContact: function () {
                return this.addCustomerContact('fulfillmentInfo', 'fulfillmentContact', [{ name: 'Shipping' }]);
            },
            addShippingAndBillingContact: function () {
                return this.addCustomerContact('fulfillmentInfo', 'fulfillmentContact', [{ name: 'Shipping' }, { name: 'Billing' }]);
            },
            addCustomerContact: function (infoName, contactName, contactTypes) {
                var customer = this.get('customer'),
                    contactInfo = this.get(infoName),
                    process = [function () {

                        // Update contact if a valid contact ID exists
                        if (orderContact.id && orderContact.id > 0) {
                            return customer.apiModel.updateContact(orderContact);
                        }

                        if (orderContact.id === -1 || orderContact.id === 1 || orderContact.id === 'new') {
                            delete orderContact.id;
                        }
                        return customer.apiModel.addContact(orderContact).then(function(contactResult) {
                                orderContact.id = contactResult.data.id;
                                return contactResult;
                            });
                    }];
                var contactInfoContactName = contactInfo.get(contactName);
                var customerContacts = customer.get('contacts');

                if (!contactInfoContactName.get('accountId')) {
                    contactInfoContactName.set('accountId', customer.id);
                }
                var orderContact = contactInfoContactName.toJSON();
                // if customer doesn't have a primary of any of the contact types we're setting, then set primary for those types
                if (!this.isSavingNewCustomer()) {
                    process.unshift(function() {
                        return customer.apiModel.getContacts().then(function(contacts) {
                            _.each(contactTypes, function(newType) {
                                var primaryExistsAlready = _.find(contacts.data.items, function(existingContact) {
                                    return _.find(existingContact.types || [], function(existingContactType) {
                                        return existingContactType.name === newType.name && existingContactType.isPrimary;
                                    });
                                });
                                newType.isPrimary = !primaryExistsAlready;
                            });
                        });
                    });
                } else {
                    _.each(contactTypes, function(type) {
                        type.isPrimary = true;
                    });
                }

                // handle email
                if (!orderContact.email) orderContact.email = this.get('email') || this.get('emailAddress') || customer.get('emailAddress') || require.mozuData('user').email;

                var contactId = orderContact.contactId;
                if (contactId) orderContact.id = contactId;
                if (!orderContact.id || orderContact.id === -1 || orderContact.id === 1 || orderContact.id === 'new') {
                    orderContact.types = contactTypes;
                    return api.steps(process);
                } else {
                    var customerContact = customerContacts.get(orderContact.id).toJSON();
                    if (this.isContactModified(orderContact, customerContact)) {
                        //keep the current types on edit
                        orderContact.types = orderContact.types ? orderContact.types : customerContact.types;
                        return api.steps(process);
                    } else {
                        var deferred = api.defer();
                        deferred.resolve();
                        return deferred.promise;
                    }
                }
            },
            isContactModified: function(orderContact, customerContact) {
                var validContact = orderContact && customerContact && orderContact.id === customerContact.id;
                var addressChanged = validContact && !_.isEqual(orderContact.address, customerContact.address);
                //Note: Only home phone is used on the checkout page
                var phoneChanged = validContact && orderContact.phoneNumbers.home &&
                                    (!customerContact.phoneNumbers.home || orderContact.phoneNumbers.home !== customerContact.phoneNumbers.home);

                //Check whether any of the fields available in the contact UI on checkout page is modified
                return validContact &&
                    (addressChanged || phoneChanged ||
                    orderContact.email !== customerContact.email || orderContact.firstName !== customerContact.firstName ||
                    orderContact.lastNameOrSurname !== customerContact.lastNameOrSurname);
            },
            saveCustomerCard: function () {
                var order = this,
                    customer = this.get('customer'), //new CustomerModels.EditableCustomer(this.get('customer').toJSON()),
                    billingInfo = this.get('billingInfo'),
                    isSameBillingShippingAddress = billingInfo.get('isSameBillingShippingAddress'),
                    isPrimaryAddress = this.isSavingNewCustomer(),
                    billingContact = billingInfo.get('billingContact').toJSON(),
                    card = billingInfo.get('card'),
                    doSaveCard = function() {
                        order.cardsSaved = order.cardsSaved || customer.get('cards').reduce(function(saved, card) {
                            saved[card.id] = true;
                            return saved;
                        }, {});
                        var method = order.cardsSaved[card.get('id') || card.get('paymentServiceCardId')] ? 'updateCard' : 'addCard';
                        card.set('contactId', billingContact.id);
                        return customer.apiModel[method](card.toJSON()).then(function(card) {
                            order.cardsSaved[card.data.id] = true;
                            return card;
                        });
                    };

                var contactId = billingContact.contactId;
                if (contactId) billingContact.id = contactId;

                if (!billingContact.id || billingContact.id === -1 || billingContact.id === 1 || billingContact.id === 'new') {
                    billingContact.types = !isSameBillingShippingAddress ? [{ name: 'Billing', isPrimary: isPrimaryAddress }] : [{ name: 'Shipping', isPrimary: isPrimaryAddress }, { name: 'Billing', isPrimary: isPrimaryAddress }];
                    return this.addCustomerContact('billingInfo', 'billingContact', billingContact.types).then(function (contact) {
                        billingContact.id = contact.data.id;
                        return contact;
                    }).then(doSaveCard);
                } else {
                    return doSaveCard();
                }
            },
            setFulfillmentContactEmail: function () {
                var fulfillmentEmail = this.get('fulfillmentInfo.fulfillmentContact.email'),
                    orderEmail = this.get('email');

                if (!fulfillmentEmail) {
                    this.set('fulfillmentInfo.fulfillmentContact.email', orderEmail);
                }
            },
            ensureEmailIsSet: function () {
                var billingEmail = this.get('billingInfo.billingContact.email'),
                    customerEmail = this.get('emailAddress') || require.mozuData('user').email,
                    orderEmail = this.get('email');

                if (billingEmail) {
                    this.set('email', billingEmail);
                }
                else if (orderEmail) {
                    this.set('billingInfo.billingContact.email', orderEmail);
                } else if (customerEmail) {
                    this.set('billingInfo.billingContact.email', customerEmail);
                    this.set('email', customerEmail);
                }
            },
            addDigitalCreditToCustomerAccount: function () {
                var billingInfo = this.get('billingInfo'),
                    customer = this.get('customer');

                var digitalCredits = billingInfo.getDigitalCreditsToAddToCustomerAccount();
                if (!digitalCredits)
                    return;
                return _.each(digitalCredits, function (cred) {
                    return customer.apiAddStoreCredit(cred.get('code'));
                });
            },
            isSavingNewCustomer: function() {
                return this.get('createAccount') && !this.customerCreated;
            },
            isNonMozuCheckout: function() {
                var activePayments = this.apiModel.getActivePayments();
                if (activePayments && activePayments.length === 0) return false;
                return (activePayments && (_.findWhere(activePayments, { paymentType: 'PayPalExpress2' }) || _.findWhere(activePayments, {paymentType: 'PayWithAmazon'}) ));
            },
            validateReviewCheckoutFields: function(){
                var validationResults = [];
                for (var field in checkoutPageValidation) {
                    if(checkoutPageValidation.hasOwnProperty(field)) {
                        var result = this.validate(field);
                        if(result) {
                            validationResults.push(result);
                        }
                    }
                }

                return validationResults.length > 0;
            },

            submit: function () {
                var order = this,
                    billingInfo = this.get('billingInfo'),
                    billingContact = billingInfo.get('billingContact'),
                    isSameBillingShippingAddress = billingInfo.get('isSameBillingShippingAddress'),
                    isSavingCreditCard = false,
                    isSavingNewCustomer = this.isSavingNewCustomer(),
                    isAuthenticated = require.mozuData('user').isAuthenticated,
                    nonStoreCreditOrGiftCardTotal = billingInfo.nonStoreCreditOrGiftCardTotal(),
                    requiresFulfillmentInfo = this.get('requiresFulfillmentInfo'),
                    requiresBillingInfo = nonStoreCreditOrGiftCardTotal > 0,
                    process = [function() {
                        return order.update({
                            ipAddress: order.get('ipAddress'),
                            shopperNotes: order.get('shopperNotes').toJSON()
                        });
                    }];

                var activePayments = this.apiModel.getActivePayments();

                var hasTokenPayment = _.findWhere(activePayments, {"paymentType" : "token"});
                if (hasTokenPayment) requiresBillingInfo = false;

                var storefrontOrderAttributes = require.mozuData('pagecontext').storefrontOrderAttributes;
                if(storefrontOrderAttributes && storefrontOrderAttributes.length > 0) {
                    var updateAttrs = [];
                    storefrontOrderAttributes.forEach(function(attr){
                        var attrVal = order.get('orderAttribute-' + attr.attributeFQN);
                        if(attrVal) {
                            updateAttrs.push({
                                'fullyQualifiedName': attr.attributeFQN,
                                'values': [ attrVal ]
                            });
                        }
                    });

                    if(updateAttrs.length > 0){
                        process.push(function(){
                            return order.apiUpdateAttributes(updateAttrs);
                        }, function() {
                            return order.apiGet();
                        });
                    }
                }

                if (this.isNonMozuCheckout()) {
                    billingContact.set("address", null);
                }

                    if(!this.get('fulfillmentInfo').get('shippingMethodCode')){
                        this.trigger('error',{message: Hypr.getLabel('chooseShippingMethod')});
                        return false;
                    }
                    if (this.isSubmitting) return;

                if (this.isSubmitting) return;

                this.isSubmitting = true;

                if (requiresBillingInfo && !billingContact.isValid()) {
                    // reconcile the empty address after we got back from paypal and possibly other situations.
                    // also happens with visacheckout ..
                    var billingInfoFromPayment = (this.apiModel.getCurrentPayment() || {}).billingInfo;
                    billingInfo.set(billingInfoFromPayment, { silent: true });
                }

                this.ensureEmailIsSet();
                this.setFulfillmentContactEmail();

                // skip payment validation, if there are no payments, but run the attributes and accept terms validation.
                if ( ((nonStoreCreditOrGiftCardTotal > 0 && this.validate() && !hasTokenPayment) || this.validateReviewCheckoutFields()) && ( !this.isNonMozuCheckout() || this.validate().agreeToTerms)) {
                    this.isSubmitting = false;
                    return false;
                }

                this.isLoading(true);

                if (isSavingNewCustomer && this.hasRequiredBehavior(1014)) {
                    process.unshift(this.addNewCustomer);
                }


                var saveCreditCard = false;
                if (activePayments !== null && activePayments.length > 0) {
                     var creditCard = _.findWhere(activePayments, { paymentType: 'CreditCard' });
                     if (creditCard && creditCard.billingInfo && creditCard.billingInfo.card) {
                         saveCreditCard = creditCard.billingInfo.card.isCardInfoSaved;
                         billingInfo.set('card', creditCard.billingInfo.card);
                     }
                 }
                 if (saveCreditCard && (this.get('createAccount') || isAuthenticated) && this.hasRequiredBehavior(1014)) {
                    isSavingCreditCard = true;
                    process.push(this.saveCustomerCard);
                    }

                if ((this.get('createAccount') || isAuthenticated) && billingInfo.getDigitalCreditsToAddToCustomerAccount().length > 0 && this.hasRequiredBehavior(1014)) {
                    process.push(this.addDigitalCreditToCustomerAccount);
                }

                //save contacts
                if (!this.isNonMozuCheckout() && isAuthenticated || isSavingNewCustomer && this.hasRequiredBehavior(1014)) {
                    if (!isSameBillingShippingAddress && !isSavingCreditCard) {
                        if (requiresFulfillmentInfo) process.push(this.addShippingContact);
                        if (requiresBillingInfo) process.push(this.addBillingContact);
                    } else if (isSameBillingShippingAddress && !isSavingCreditCard) {
                        process.push(this.addShippingAndBillingContact);
                    } else if (!isSameBillingShippingAddress && isSavingCreditCard && requiresFulfillmentInfo) {
                        process.push(this.addShippingContact);
                    }
                }

                process.push(/*this.finalPaymentReconcile, */this.apiCheckout);

                api.steps(process).then(this.onCheckoutSuccess, this.onCheckoutError);
                window.checkoutViews.parentView.model.get("fulfillmentInfo").unset('prevoiusSelectedMethod');

            },
            update: function() {
                var j = this.toJSON();
                return this.apiModel.update(j);
            },
            refresh: function() {
              var me = this;
              this.trigger('beforerefresh');
              return this.apiGet().then(function() {
                me.trigger('refresh');
                // me.runForAllSteps(function() {
                //   this.trigger("sync");
                // });
              });
            },
            runForAllSteps: function(cb) {
                var me = this;
                _.each([
                       'fulfillmentInfo.fulfillmentContact',
                       'fulfillmentInfo',
                       'billingInfo'
                ], function(name) {
                    cb.call(me.get(name));
                });
            },
            isReady: function (val) {
                this.set('isReady', val);
            },
            toJSON: function (options) {
                var j = Backbone.MozuModel.prototype.toJSON.apply(this, arguments);
                if (!options || !options.helpers) {
                    delete j.password;
                    delete j.confirmPassword;
                }
                return j;
            }
        });

        return {
            CheckoutPage: CheckoutPage
        };
    }
);

define('modules/models-token',["underscore", "modules/backbone-mozu"], function (_, Backbone) {
  var Token = Backbone.MozuModel.extend({
      mozuType: 'token'
  });
  return {
      Token: Token
  };
});

define('modules/applepay',['modules/jquery-mozu', 'hyprlive' ,"modules/api",'hyprlivecontext','underscore', "modules/backbone-mozu", 'modules/models-cart', 'modules/checkout/models-checkout-page', 'modules/models-checkout', 'modules/models-token'
],
function($, Hypr, Api, hyprlivecontext, _, Backbone, CartModels, CheckoutModels, OrderModels, TokenModels) {
  var apiContext = require.mozuData('apicontext');
  var ApplePaySession = window.ApplePaySession;
  var ApplePayCheckout = Backbone.MozuModel.extend({ mozuType: 'checkout'});
  var ApplePayOrder = Backbone.MozuModel.extend({ mozuType: 'order' });

  /* 
    This module:
      - displays and styles an Apple Pay button
      - makes a request to apple with context-dependent info to start an Apple Pay session when the button is clicked
      - creates checkout from cart or fetches a current checkout to apply the information to
      - assigns a bunch of handlers to the session, mostly useless to us but necessary for Apple
      - when the payment is authorized on an iPhone, assigns the new information to the new checkout
      - if there are any problems in assigning this information, closes the Apple Pay sheet and displays an error on page
      - loads the checkout page complete with the new information from apple.
  */

  var ApplePay = {
    init: function(style){
        var self = this;
        this.isCart = window.location.href.indexOf("cart") > 0;
        var paymentSettings = _.findWhere(hyprlivecontext.locals.siteContext.checkoutSettings.externalPaymentWorkflowSettings, {"name" : "APPLEPAY"});
        if ((!paymentSettings || !paymentSettings.isEnabled) || (self.scriptLoaded) || (self.getTotal() === 0)) return;
        self.scriptLoaded = true;
        this.multishipEnabled = hyprlivecontext.locals.siteContext.generalSettings.isMultishipEnabled;
        this.storeName = hyprlivecontext.locals.siteContext.generalSettings.websiteName;
        // configure button with selected style and language
        this.setStyle(style);
        this.setLanguage();
        /*
          canMakePayments passes if:
          - the user is on the most recent version of Safari on OSX sierra or a recent iPad
          - the user has a wallet set up on a logged-in, up-to-date iPhone (must be iPhone - not iPad)
        */
        if (ApplePaySession && ApplePaySession.canMakePayments()){
            $("#applePayButton").show();

            // when an element is rendered dynamically, any click listeners assigned get removed
            // so we are assigning our click listener to the document and specifying a selector.
            // we have safeguards preventing this script from running multiple times, but we've included
            // an "off" click just in case - if this handler got assigned multiple times, it would try to run
            // the session maker more than once and initialize more than one apple pay session, causing an error.
            $(document).off('click', '.apple-pay-button').on('click', '.apple-pay-button', function(event){
              var request = self.buildRequest();
              self.session = new ApplePaySession(3, request);
              self.getOrder().then(function(orderModel){
              //orderModel is either an ApplePayCheckout or ApplePayOrder
              self.orderModel = orderModel;
              self.applePayToken = new TokenModels.Token({ type: 'APPLEPAY' });

              // first define our ApplePay Session with the version number.
              // then we define a set of handlers that get called by apple.
              // after our session object knows how to respond to apple's various events,
              // we call begin(). The merchant is then validated, initializing
              // the 'true' session.

              // set handlers. These all get called by apple.
              self.session.onvalidatemerchant = function(event){
                  var validationURL = event.validationURL;
                  self.applePayToken.apiModel.thirdPartyPaymentExecute({
                      methodName: "Session",
                      cardType: "ApplePay",
                      body: {
                          domain: window.location.hostname,
                          storeName: self.storeName,
                          validationURL: validationURL
                      }
                    }).then(function(response){
                    // When apple is finished making this call,
                    // it opens the payment sheet and automatically selects
                    // available cards, addresses, and contact info, which triggers
                    // the following handlers.
                    self.session.completeMerchantValidation(response);

                  }, function(error){
                      self.handleError(error);
                  });
              };
              //these handlers each have a corresponding callback to apple
              //apple expects us to have changed the price according to
              //shipping costs at this point so we have to send them
              // a 'new' amount
              var selectionPayload = self.completeSelectionPayload();
              self.session.onpaymentmethodselected = function(event){
                  self.session.completePaymentMethodSelection(selectionPayload);
              };
              self.session.onshippingcontactselected = function(event) {
                  self.session.completeShippingContactSelection(selectionPayload);
              };
              self.session.onbillingcontactselected = function(event){
                self.session.completeBillingContactSelection(selectionPayload);
              };

              //This handler gets called after the user authorizes the wallet payment
              //on their phone. This is when we receive the payment token from apple.
              self.session.onpaymentauthorized = function(event) {
                self.applePayToken.set('tokenObject', event.payment.token);
                self.applePayToken.apiCreate().then(function(response){
                  if (!response.isSuccessful){
                    self.handleError(null, "Could not create payment token.");
                  } else {
                    var appleBillingContact = event.payment.billingContact;
                    var appleShippingContact = event.payment.shippingContact;
                    var createPaymentPayload = self.buildCreatePaymentPayload(appleBillingContact, appleShippingContact, response.id);
                    var currentPayment = self.orderModel.apiModel.getCurrentPayment() || {};
                    self.setShippingContact(appleShippingContact).then(function(shippingContactResponse){
                        self.setShippingMethod().then(function(shippingMethodResponse){
                            if (!currentPayment.id){
                              self.applyPayment(createPaymentPayload);
                            } else {
                              self.orderModel.apiVoidPayment(currentPayment.id).ensure(function(){
                                  self.applyPayment(createPaymentPayload);
                              });
                          }
                        }, function(shippingMethodError){
                            self.handleError(shippingMethodError);
                        });
                    }, function(shippingContactError){
                        self.handleError(shippingContactError);
                    });
                }
            });
          };
          self.session.begin();

        }); //getorder apicall
      }); // click handler
    } // if statement canMakePayments
  },
    // We only want to get shipping info from the user via applePay if BOTH:
    // 1. We are currently on the cart. When we kick the user to checkout, shipping info will be populated.
    // 2. The cart has items that will be shipped. If it's all pickup items, we don't want to bother asking for shipping info and confuse them.
    isShippingInfoNeeded: function(){
        var self = this;
        if (!self.isCart) return false;
        this.cart = window.cartView.cartView.model;
        var hasShippingItem = false;
        var items = this.cart.get('items');
        items.forEach(function(item){
            if (item.get('fulfillmentMethod').toLowerCase() == "ship"){
                hasShippingItem = true;
            }
        });
        return hasShippingItem;
    },
    handleError: function(error, message){
      //error can be a the error object returned from a rejected promise
      //message can be a string if you want to pass in your own
      var self = this;
      var currentPayment = self.orderModel.apiModel.getCurrentPayment() || {};
      var errorMessage = "";
      if (error.items && error.items.length) {
          errorMessage = error.items[0].message;
      } else {
        errorMessage = error.message || message;
      }
      //this function works on both the cart page and the checkout page
      //a model which is attached to a backbone view with a messages element defined is necessary to trigger 'error'.
      //conveniently, we keep our cart and checkout backbone views stored on our window object.
      var errorMessageHandler;
      if (self.isCart){
          errorMessageHandler = window.cartView.cartView.model;
      } else {
          errorMessageHandler = window.checkoutViews.parentView.model;
      }
      self.session.completePayment({"status": 1});
         errorMessageHandler.trigger('error', {
             message: errorMessage
         });
        // Apple has its own cool error handling functionality which entirely
        // did not work at all. I think it's an issue with Apple. So we aren't using it.
        // Its future implementation isn't off the table though.
    },
    applyPayment: function(createPaymentPayload){
      var self = this;
      self.orderModel.apiCreatePayment(createPaymentPayload).then(function(order){
          self.orderModel.set(order.data);
          self.session.completePayment({"status": 0});
          var id = self.orderModel.get('id');
          var redirectUrl = hyprlivecontext.locals.pageContext.secureHost;
          var checkoutUrl = self.multishipEnabled ? "/checkoutv2" : "/checkout";
          redirectUrl += checkoutUrl + '/' + id;
          window.location.href = redirectUrl;
      }, function(createPaymentError){
          self.handleError(createPaymentError);
      });
    },
    setStyle: function(style){
        var self = this;
        var styleClass = "apple-pay-button-";
        if (!style){
          style = "black";
        }
        styleClass += style;
        $("#applePayButton").addClass(styleClass);
    },
    setLanguage: function(){
      //This language setter will only matter if the merchant adds additional support
      //for displaying other kinds of Apple Pay buttons.
      //Right now the button will just say "[apple logo]Pay",
      //which doesn't change between languages.
        var locale = apiContext.headers['x-vol-locale'];
        $("#applePayButton").attr('lang', locale.substring(0, 2));
    },
    getOrder: function(){
        var self = this;
        if (this.isCart){
              this.cart = window.cartView.cartView.model;
            if (this.multishipEnabled){
                return this.cart.apiCheckout2().then(function(responseData){
                    return new ApplePayCheckout(responseData.data);
                }, function(error){
                    self.handleError(error);
                });
            } else {
                return this.cart.apiCheckout().then(function(responseData){
                    return new ApplePayOrder(responseData.data);
                }, function(error){
                    self.handleError(error);
                });
            }
        } else {
            if (this.multishipEnabled){
                var checkout = ApplePayCheckout.fromCurrent();
                return checkout.fetch();
            } else {
                var order = new ApplePayOrder(require.mozuData('checkout'));
                return order.fetch();
            }
        }
    },
    // base method for setting shipping address. expected to return a promise.
    // returns a multiship-specific version of this function when necessary.
    setShippingContact: function(appleShippingContact){
      if (!this.isShippingInfoNeeded()){
        var deferred = Api.defer();
        deferred.resolve();
        return deferred.promise;
      }
      var self = this,
          user = require.mozuData('user');

          var appleFulfillmentData = {};

          appleFulfillmentData.fulfillmentContact = {
              "address": {
                  "address1": appleShippingContact.addressLines[0] || "",
                  "address2": appleShippingContact.addressLines[1] || "",
                  "address3": appleShippingContact.addressLines[2] || "",
                  "address4": appleShippingContact.addressLines[3] || "",
                  "cityOrTown": appleShippingContact.locality,
                  "countryCode": appleShippingContact.countryCode.toUpperCase(),
                  "postalOrZipCode": appleShippingContact.postalCode,
                  "stateOrProvince": appleShippingContact.administrativeArea
              },
              "firstName": appleShippingContact.givenName,
              "lastNameOrSurname": appleShippingContact.familyName,
              "phoneNumbers": {
                  "home": appleShippingContact.phoneNumber
              }
          };

      if (self.multishipEnabled){
        return self.setShippingDestinations(appleFulfillmentData.fulfillmentContact);
      } else {
        var fulfillmentInfo = appleFulfillmentData;
        if (user && user.email) {
            fulfillmentInfo.fulfillmentContact.email =  user.email;
        }
        else {
            fulfillmentInfo.fulfillmentContact.email = appleShippingContact.emailAddress;
        }
        return self.orderModel.apiModel.updateShippingInfo(fulfillmentInfo,  { silent: true }).then(function(response){
            self.orderModel.set('fulfillmentInfo', response.data);
        }, function(error){
            return error;
        });
      }
    },
    // shipping address setter for multiship.
    setShippingDestinations: function(fulfillmentContact){
        var self = this;
        var destinationPayload = {
            destinationContact: fulfillmentContact
        };
        return self.orderModel.apiModel.addShippingDestination(destinationPayload).then(function(response){
            var destinationId = response.data.id;
            return self.orderModel.apiModel.setAllShippingDestinations({
              destinationId: destinationId
            }).then(function(response){
              self.orderModel.set(response);
              return response;
            }, function(error){
              return error;
            });
        });

    },
    // sets the shipping method on the order model to least expensive available. Expected to return a promise
    setShippingMethod: function (){
      var self = this;

      // return a deferred if there are no ship items or we're already in checkout
      if (!self.isShippingInfoNeeded()){
          var deferred = Api.defer();
          deferred.resolve();
          return deferred.promise;
      }

      return self.orderModel.apiModel.getShippingMethods(null, {silent:true}).then(
          function (methods) {

              if (methods.length === 0) {
                  self.handleError(null, Hypr.getLabel('noShippingMethods'));
              }

              if (self.multishipEnabled){
                var shippingMethods = [];

                _.each(methods, function(method) {
                    var existing = _.findWhere(self.orderModel.get('groupings'), {'id' : method.groupingId });
                    var shippingRate = null;

                    if (existing)
                        shippingRate = _.findWhere(method.shippingRates, {'shippingMethodCode': existing.shippingMethodCode});

                    if (!shippingRate)
                         shippingRate = _.min(method.shippingRates, function (rate){ return rate.price;});

                    shippingMethods.push({groupingId: method.groupingId, shippingRate: shippingRate});
                });
                var shippingMethodsPayload = { id: self.orderModel.get('id'), postdata: shippingMethods };

                return self.orderModel.apiModel.setShippingMethods(shippingMethodsPayload).then(function(response){
                    self.orderModel.set(response.data);
                    return response;
                }, function(error){
                  return error;
                });

              } else {
              var shippingMethod = "";
              if (!shippingMethod || !shippingMethod.shippingMethodCode)
                  shippingMethod =_.min(methods, function(method){return method.price;});

              var fulfillmentInfo = self.orderModel.get("fulfillmentInfo");
              fulfillmentInfo.shippingMethodCode = shippingMethod.shippingMethodCode;
              fulfillmentInfo.shippingMethodName = shippingMethod.shippingMethodName;
              return self.orderModel.apiModel.updateShippingInfo(fulfillmentInfo,  { silent: true }).then(function(response){
                  self.orderModel.set(response.data);
                  return response;
              }, function (error){
                return error;
              });
            }
          }
        );
    },

    // All of the handlers for completing payment and address selection require
    // that we send Apple an object with updated line items for amounts.
    // Each of them use the same format of object, so we use this function.
    // We have opted not to include details about Tax, Shipping & Handling, or Discounts out of the box.
    // There are too many variations in the model structure to account for this efficiently here;
    // we'll leave that up to the merchant.
    completeSelectionPayload: function(){
      var self = this;
      var totalAmount = self.getTotal();
      var newLineItems = [];
      //casing for the subtotal value varies depending on context apparently... eye roll emoji
      var subtotalAmount = (self.orderModel.get('subTotal') || self.orderModel.get('subtotal')) - (self.orderModel.get('itemLevelProductDiscountTotal') || 0);
      if (totalAmount != subtotalAmount){
          newLineItems.push({
              "label": "Subtotal",
              "amount": subtotalAmount.toFixed(2)
          });
      }
      return {
          newTotal: {
            "label": self.storeName,
            "amount": totalAmount,
            "type": "final"
          },
          newLineItems: newLineItems
        };
    },
    buildCreatePaymentPayload: function(appleBillingContact, appleShippingContact, responseId){
      var self = this;
      var billingEmail = appleShippingContact.emailAddress;
      var user = require.mozuData('user');
      if (user && user.email) {
          billingEmail = user.email;
      }

      var payload = {
        amount: self.getTotal(),
        currencyCode: apiContext.headers['x-vol-currency'],
        newBillingInfo: {
            paymentType: 'token',
            billingContact: {
                email: billingEmail,
                firstName: appleBillingContact.givenName,
                lastNameOrSurname: appleBillingContact.familyName,
                phoneNumbers: {
                    home: appleShippingContact.phoneNumber
                },
                address: {
                    address1: appleBillingContact.addressLines[0],
                    address2: appleBillingContact.addressLines[1] || null,
                    address3: appleBillingContact.addressLines[2] || null,
                    address4: appleBillingContact.addressLines[3] || null,
                    cityOrTown: appleBillingContact.locality,
                    stateOrProvince: appleBillingContact.administrativeArea,
                    postalOrZipCode: appleBillingContact.postalCode,
                    countryCode: appleBillingContact.countryCode.toUpperCase()
                }
            },
            token: {
                paymentServiceTokenId: responseId,
                type: 'ApplePay'
            }
        }
      };
      return payload;
    },
    getSupportedNetworks: function(){
      var supportedCards = hyprlivecontext.locals.siteContext.checkoutSettings.supportedCards;
      var supportedNetworks = [];
      Object.keys(supportedCards).forEach(function (key){
          if (supportedCards[key] =="MC"){
            supportedNetworks.push("mastercard");
          } else {
            supportedNetworks.push(supportedCards[key].toLowerCase());
          }
      });

      if (!supportedCards || Object.keys(supportedCards).length === 0){
        supportedNetworks = ["visa", "mastercard", "amex", "discover"];
      }
      return supportedNetworks;
    },
    buildRequest: function(){
      /* build the request out of the store name, order total,
      available payment methods. determine which contact fields are necessary
      based one whether we're in checkout or cart.
      */
      var self = this;
      var supportedNetworks = self.getSupportedNetworks();
      var requiredShippingContactFields = ["phone", "email"];
      //If we aren't on the cart, we don't need to get shipping info
      //however, for some reason, you can only get email and phone number
      //on the apple shipping contact fields - not their billing contact fields
      if (this.isShippingInfoNeeded()){
        requiredShippingContactFields.push("postalAddress");
        requiredShippingContactFields.push("name");
      }
      //toFixed returns a string. We are fine with that.

      var totalAmount = self.getTotal();
      var total = { label: self.storeName, amount: totalAmount.toFixed(2) };
      var requiredBillingContactFields = [
          'postalAddress',
          'name'
      ];

      var request = {
        countryCode: apiContext.headers['x-vol-locale'].slice(-2),
        currencyCode: apiContext.headers['x-vol-currency'],
        supportedNetworks: supportedNetworks,
        total: total,
        merchantCapabilities: ['supports3DS'], // don't know what this means but it is necessary
        requiredShippingContactFields: requiredShippingContactFields,
        requiredBillingContactFields: requiredBillingContactFields
      };
      return request;
    },
    getTotal: function(){
      // The total we wish to expose to Apple depends on context the of the call. This function
      // figures out which amount is most appropriate.
      var totalAmount = 0;
      var self = this;
      if (!this.orderModel){
        // we aren't fetching our data from the module's orderModel yet because
        // it isn't created yet. These view models are the most up-to-date info
        // available. If we're here, it means we're being called before the session
        // process has begun
        if (this.isCart){
            totalAmount = window.cartView.cartView.model.get('total');
        } else {
            totalAmount = window.checkoutViews.orderSummary.model.get('total');
        }
      } else {
        // If we're here, it means we've already created an order model. It also
        // means this is probably getting called by one of the handlers Apple makes us
        // assign to the session.
        var activePayments = this.orderModel.apiModel.getActivePayments();
        var hasNonDigitalCreditPayment = (_.filter(activePayments, function (item) { return (item.paymentType !== 'StoreCredit' && item.paymentType !== 'GiftCard'); })).length > 0;
        if (hasNonDigitalCreditPayment){
            //a payment has already been applied, and we shouldn't void it before completing the apple pay process,
            //so we cannot rely on the amountRemainingForPayment.
            //We must calculate the amount ourselves.
            totalAmount = self.nonStoreCreditOrGiftCardTotal();
        } else {
          //If there are no non-store-credit payments already applied to the order, we can expect this value to work.
          totalAmount = self.orderModel.get('amountRemainingForPayment');
        }
      }
      return totalAmount;
    },
    nonStoreCreditOrGiftCardTotal: function () {
      var self = this,
          total = self.orderModel.get('total'),
          result,
          activeGiftCards = self.orderModel.apiModel.getActiveGiftCards(),
          activeCredits = self.orderModel.apiModel.getActiveStoreCredits();

          if (!activeGiftCards && !activeCredits) return total;

          var giftCardTotal = _.reduce(activeGiftCards || [], function(sum, giftCard) {
              return sum + giftCard.amountRequested;
          }, 0);

          var storeCreditTotal = _.reduce(activeCredits || [], function (sum, credit){
              return sum + credit.amountRequested;
          }, 0);

          result = total - giftCardTotal - storeCreditTotal;
          return total.toFixed(2);
    },
    hideOrShowButton: function(){
      //meant to be called on cart page render; hides the button if total is 0
      if (this.getTotal() === 0){
        $('#applePayButton').hide();
      } else if (ApplePaySession && ApplePaySession.canMakePayments()) {
        $('#applePayButton').show();
      }
    }
  };
  return ApplePay;
});

define('modules/checkout/steps/step3/views-payments',["modules/jquery-mozu",
    "underscore",
    "hyprlive",
    "modules/backbone-mozu",
    'hyprlivecontext',
    'modules/preserve-element-through-render',
    'modules/checkout/steps/views-base-checkout-step',
    'modules/xpress-paypal',
    'modules/applepay'],
    function ($, _, Hypr, Backbone, HyprLiveContext, preserveElements, CheckoutStepView,PayPal, ApplePay) {
        var visaCheckoutSettings = HyprLiveContext.locals.siteContext.checkoutSettings.visaCheckout;
        var pageContext = require.mozuData('pagecontext');
        var poCustomFields = function() {

            var fieldDefs = [];

            var isEnabled = HyprLiveContext.locals.siteContext.checkoutSettings.purchaseOrder &&
                HyprLiveContext.locals.siteContext.checkoutSettings.purchaseOrder.isEnabled;

                if (isEnabled) {
                    var siteSettingsCustomFields = HyprLiveContext.locals.siteContext.checkoutSettings.purchaseOrder.customFields;
                    siteSettingsCustomFields.forEach(function(field) {
                        if (field.isEnabled) {
                            fieldDefs.push('purchaseOrder.pOCustomField-' + field.code);
                        }
                    }, this);
                }

            return fieldDefs;
        };
        var BillingInfoView = CheckoutStepView.extend({
            templateName: 'modules/multi-ship-checkout/step-payment-info',
            autoUpdate: [
                'savedPaymentMethodId',
                'paymentType',
                'card.paymentOrCardType',
                'card.cardNumberPartOrMask',
                'card.nameOnCard',
                'card.expireMonth',
                'card.expireYear',
                'card.cvv',
                'card.isCardInfoSaved',
                'check.nameOnCheck',
                'check.routingNumber',
                'check.checkNumber',
                'isSameBillingShippingAddress',
                'billingContact.firstName',
                'billingContact.lastNameOrSurname',
                'billingContact.address.address1',
                'billingContact.address.address2',
                'billingContact.address.address3',
                'billingContact.address.cityOrTown',
                'billingContact.address.countryCode',
                'billingContact.address.stateOrProvince',
                'billingContact.address.postalOrZipCode',
                'billingContact.phoneNumbers.home',
                'billingContact.email',
                'creditAmountToApply',
                'digitalCreditCode',
                'purchaseOrder.purchaseOrderNumber',
                'purchaseOrder.paymentTerm',
                'giftCardNumber',
                'giftCardSecurityCode'
            ].concat(poCustomFields()),
            renderOnChange: [
                'billingContact.address.countryCode',
                'paymentType',
                'isSameBillingShippingAddress',
                'usingSavedCard',
                'savedPaymentMethodId'
            ],
            additionalEvents: {
                "blur [data-mz-value='card.cardNumberPartOrMask']": "changeCardType",
                "change [data-mz-digital-credit-enable]": "enableDigitalCredit",
                "change [data-mz-digital-credit-amount]": "applyDigitalCredit",
                "change [data-mz-gift-card-amount]": "applyGiftCard",
                "change [data-mz-gift-card-enable]": "enableGiftCard",
                "change [data-mz-digital-add-remainder-to-customer]": "addRemainderToCustomer",
                "change [name='paymentType']": "resetPaymentData",
                "change [data-mz-purchase-order-payment-term]": "updatePurchaseOrderPaymentTerm",
                "change [data-mz-single-fulfillment-contact]": "handleBillingAddressSelectorChange"
            },
            changeCardType:function(e){
                window.checkoutModel = this.model;
                var number = e.target.value;
                var cardType='';
                // visa
                var re = new RegExp("^4");
                if (number.match(re) !== null){
                    cardType = "VISA";
                }

                // Mastercard 
                // Updated for Mastercard 2017 BINs expansion
                 if (/^(5[1-5][0-9]{14}|2(22[1-9][0-9]{12}|2[3-9][0-9]{13}|[3-6][0-9]{14}|7[0-1][0-9]{13}|720[0-9]{12}))$/.test(number)) 
                    cardType = "MC";

                // AMEX
                re = new RegExp("^3[47]");
                if (number.match(re) !== null)
                    cardType = "AMEX";

                // Discover
                re = new RegExp("^(6011|622(12[6-9]|1[3-9][0-9]|[2-8][0-9]{2}|9[0-1][0-9]|92[0-5]|64[4-9])|65)");
                if (number.match(re) !== null)
                    cardType = "DISCOVER";
                
                $('.mz-card-type-images').find('span').removeClass('active');
                if(cardType){
                    this.model.set('card.paymentOrCardType',cardType);
                    $("#mz-payment-credit-card-type").val(cardType);
                    $('.mz-card-type-images').find('span[data-mz-card-type-image="'+cardType+'"]').addClass('active');
                }
                else{
                    this.model.set('card.paymentOrCardType',null);    
                }
            },
            initialize: function () {
                // this.addPOCustomFieldAutoUpdate();
                this.listenTo(this.model, 'change:giftCardNumber', this.onEnterGiftCardInfo, this);
                this.listenTo(this.model, 'change:giftCardSecurityCode', this.onEnterGiftCardInfo, this);
                this.listenTo(this.model, 'change:digitalCreditCode', this.onEnterDigitalCreditCode, this);
                this.listenTo(this.model, 'orderPayment', function (order, scope) {
                        this.render();
                }, this);
                this.listenTo(this.model, 'updateCheckoutPayment', function (order, scope) {
                        this.render();
                }, this);
                this.listenTo(this.model, 'change:savedPaymentMethodId', function (order, scope) {
                    $('[data-mz-saved-cvv]').val('').change();
                    this.render();
                }, this);
                this.codeEntered = !!this.model.get('digitalCreditCode');
            },
            resetPaymentData: function (e) {
                if (e.target !== $('[data-mz-saved-credit-card]')[0]) {
                    $("[name='savedPaymentMethods']").val('0');
                }
                var billingContactEmail = this.model.get('billingContact').get('email');
                this.model.clear();
                this.model.resetAddressDefaults();
                this.model.get('billingContact').set('email', billingContactEmail);
                if(HyprLiveContext.locals.siteContext.checkoutSettings.purchaseOrder.isEnabled) {
                    this.model.resetPOInfo();
                }
            },
            updatePurchaseOrderPaymentTerm: function(e) {
                this.model.setPurchaseOrderPaymentTerm(e.target.value);
            },
            render: function() {
                preserveElements(this, ['.v-button', '.p-button','#amazonButtonPaymentSection', '.apple-pay-button'], function() {
                    CheckoutStepView.prototype.render.apply(this, arguments);
                });
                if ($("#AmazonPayButton").length > 0 && $("#amazonButtonPaymentSection").length > 0)
                     $("#AmazonPayButton").removeAttr("style").appendTo("#amazonButtonPaymentSection");

                var status = this.model.stepStatus();
                if (visaCheckoutSettings.isEnabled && !this.visaCheckoutInitialized && this.$('.v-button').length > 0) {
                     window.onVisaCheckoutReady = _.bind(this.initVisaCheckout, this);
                     require([pageContext.visaCheckoutJavaScriptSdkUrl]);
                     this.visaCheckoutInitialized = true;
                }

                // There is probably a better place to set this than here.
                // We just need to make sure this gets set before we open the form to add a new card.
                if (Hypr.getThemeSetting('isCvvSuppressed') && this.model.get('card')) {
                    this.model.get('card').set('isCvvOptional', true);
                }

                if (this.$(".apple-pay-button").length > 0)
                    ApplePay.init();

                if (this.$(".p-button").length > 0)
                    PayPal.loadScript();
            },
            updateAcceptsMarketing: function(e) {
                this.model.getOrder().set('acceptsMarketing', $(e.currentTarget).prop('checked'));
            },
            updatePaymentType: function(e) {
                var newType = $(e.currentTarget).val();
                this.model.set('usingSavedCard', e.currentTarget.hasAttribute('data-mz-saved-credit-card'));
                this.model.set('paymentType', newType);
            },
            edit: function() {
                this.model.edit();
                this.beginEditingCard();
            },            
            beginEditingCard: function() {
                var me = this;

                if (!this.model.isExternalCheckoutFlowComplete()) {
                    this.editing.savedCard = true;
                    this.render();
                } else {
                    this.cancelExternalCheckout();
                }
            },
            cancelExternalCheckout: function () {
                var me = this;
                this.doModelAction('cancelExternalCheckout').then(function () {
                    me.editing.savedCard = false;
                    me.render();
                });
            },
            beginEditingBillingAddress: function() {
                this.editing.savedBillingAddress = true;
                this.render();
            },
            beginApplyCredit: function () {
                this.model.beginApplyCredit();
                this.render();
            },
            cancelApplyCredit: function () {
                this.model.closeApplyCredit();
                this.render();
            },
            finishApplyCredit: function () {
                var self = this;
                this.model.finishApplyCredit().then(function() {
                    self.render();
                });
            },
            handleBillingAddressSelectorChange : function(e){
                var self = this;
                var $target = $(e.currentTarget);
                var destinationId = $target.val();
                var customerContactId = $target.find(":selected").data("mzCustomercontactid");

                if($target.val() === "" && !customerContactId) {
                    return false;
                }

                var destination = this.model.getOrder().get('destinations').get(destinationId);
                if(!destination) {
                    destination = this.model.getOrder().get('destinations').findWhere({customerContactId: customerContactId });
                }

                if(destination){
                    self.model.updateBillingContact(destination.get('destinationContact'));
                }
                self.render();
            },
            handleNewContact : function(){
                var self = this;
                this.listenTo(this.model.getOrder().get('dialogContact'), 'dialogClose', function () {
                       self.render();
                }, this);
                this.model.addNewContact();
            },
            removeCredit: function (e) {
                var self = this,
                    id = $(e.currentTarget).data('mzCreditId');
                this.model.removeCredit(id).then(function () {
                    self.render();
                });
            },
            getDigitalCredit: function (e) {
                var self = this;
                this.$el.addClass('is-loading');
                this.model.getDigitalCredit().ensure(function () {
                    self.$el.removeClass('is-loading');
                });
            },
            getGatewayGiftCard: function (e) {
              var self = this;
              this.$el.addClass('is-loading');
              this.model.getGatewayGiftCard().ensure(function() {
                   self.$el.removeClass('is-loading');
               });
            },
            stripNonNumericAndParseFloat: function (val) {
                if (!val) return 0;
                var result = parseFloat(val.replace(/[^\d\.]/g, ''));
                return isNaN(result) ? 0 : result;
            },
            applyDigitalCredit: function(e) {
                var val = $(e.currentTarget).prop('value'),
                    creditCode = $(e.currentTarget).attr('data-mz-credit-code-target');  //target
                if (!creditCode) {
                    //window.console.log('checkout.applyDigitalCredit could not find target.');
                    return;
                }
                var amtToApply = this.stripNonNumericAndParseFloat(val);

                this.model.applyDigitalCredit(creditCode, amtToApply, true);
                this.render();
            },
            applyGiftCard: function(e) {
                var self = this,
                    val = $(e.currentTarget).prop('value'),
                    giftCardId = $(e.currentTarget).attr('data-mz-gift-card-target');
                if (!giftCardId) {
                  return;
                }
                var amtToApply = this.stripNonNumericAndParseFloat(val);
                this.$el.addClass('is-loading');
                return this.model.applyGiftCard(giftCardId, amtToApply, true).then(function(){
                    self.$el.removeClass('is-loading');
                    this.render();
                }, function(error){
                    self.$el.removeClass('is-loading');
                });
            },
            onEnterGiftCardInfo: function(model) {
              if (model.get('giftCardNumber') && model.get('giftCardSecurityCode')){
                this.$el.find('input#gift-card-security-code').siblings('button').prop('disabled', false);
              } else {
                this.$el.find('input#gift-card-security-code').siblings('button').prop('disabled', true);
              }

            },
            onEnterDigitalCreditCode: function(model, code) {
                if (code && !this.codeEntered) {
                    this.codeEntered = true;
                    this.$el.find('input.digital-credit-code').siblings('button').prop('disabled', false);
                }
                if (!code && this.codeEntered) {
                    this.codeEntered = false;
                    this.$el.find('input.digital-credit-code').siblings('button').prop('disabled', true);
                }
            },
            enableDigitalCredit: function(e) {
                var creditCode = $(e.currentTarget).attr('data-mz-credit-code-source'),
                    isEnabled = $(e.currentTarget).prop('checked') === true,
                    targetCreditAmtEl = this.$el.find("input[data-mz-credit-code-target='" + creditCode + "']"),
                    me = this;

                if (isEnabled) {
                    targetCreditAmtEl.prop('disabled', false);
                    me.model.applyDigitalCredit(creditCode, null, true);
                } else {
                    targetCreditAmtEl.prop('disabled', true);
                    me.model.applyDigitalCredit(creditCode, 0, false);

                }

            },
            enableGiftCard: function(e){
                var isEnabled = $(e.currentTarget).prop('checked') === true,
                    giftCardId = $(e.currentTarget).attr('data-mz-payment-id'),
                    targetAmtEl = this.$el.find("input[data-mz-gift-card-target='" + giftCardId + "']"),
                    me = this;

                if (isEnabled) {
                  targetAmtEl.prop('disabled', false);
                  me.model.applyGiftCard(giftCardId, null, true);
                } else {
                  targetAmtEl.prop('disabled', true);
                  me.model.applyGiftCard(giftCardId, 0, false);
                }
            },
            addRemainderToCustomer: function (e) {
                var creditCode = $(e.currentTarget).attr('data-mz-credit-code-to-tie-to-customer'),
                    isEnabled = $(e.currentTarget).prop('checked') === true;
                this.model.addRemainingCreditToCustomerAccount(creditCode, isEnabled);
            },
            handleEnterKey: function (e) {
              //TODO: add handling for enter key in giftcard fields
                var source = $(e.currentTarget).attr('data-mz-value');
                if (!source) return;
                switch (source) {
                    case "creditAmountApplied":
                        return this.applyDigitalCredit(e);
                    case "digitalCreditCode":
                        return this.getDigitalCredit(e);
                    case "giftCardNumber":
                        if (this.model.get('giftCardNumber') && this.model.get('giftCardSecurityCode')){
                            return this.getGatewayGiftCard(e);
                        } else {
                            //TODO: trigger error message
                        }
                        break;
                    case "giftCardSecurityCode":
                        if (this.model.get('giftCardNumber') && this.model.get('giftCardSecurityCode')){
                            return this.getGatewayGiftCard(e);
                        } else {
                            //TODO: trigger error message
                        }
                        break;
                }
            },
            /* begin visa checkout */
            initVisaCheckout: function () {
                var me = this;
                var apiKey = visaCheckoutSettings.apiKey || '0H1JJQFW9MUVTXPU5EFD13fucnCWg42uLzRQMIPHHNEuQLyYk';
                var clientId = visaCheckoutSettings.clientId || 'mozu_test1';
                var orderModel = this.model.getOrder();


                if (!window.V) {
                    //window.console.warn( 'visa checkout has not been initilized properly');
                    return false;
                }
                // on success, attach the encoded payment data to the window
                // then call the sdk's api method for digital wallets, via models-checkout's helper
                window.V.on("payment.success", function(payment) {
                    //window.console.log({ success: payment });
                    me.editing.savedCard = false;
                    me.model.parent.processDigitalWallet('VisaCheckout', payment);
                });



                window.V.init({
                    apikey: apiKey,
                    clientId: clientId,
                    paymentRequest: {
                        currencyCode: orderModel.get('currencyCode'),
                        subtotal: "" + orderModel.get('subtotal')
                    }
                });
            }
            /* end visa checkout */
        });

    return BillingInfoView;
});

define('modules/views-modal-dialog',['modules/jquery-mozu','underscore',"modules/backbone-mozu",'hyprlive', 'modules/modal-dialog'], function($, _, Backbone, Hypr, Dialog) {
    var ModalDialog = Backbone.MozuView.extend({
            templateName: 'modules/common/modal-dialog',
            initialize: function() { 
                var self = this;
                
                self.listenTo(this.model, 'openDialog', function () {
                    self.handleDialogOpen();
                });
                self.listenTo(this.model, 'saveDialog', function () {
                    self.handleDialogSave();
                });
                self.listenTo(this.model, 'closeDialog', function () {
                    self.handleDialogClose();
                });
                self.listenTo(this.model, 'cancelDialog', function () {
                    self.handleDialogCancel();
                });

                this.initDialog(); 
            },
            initDialog: function(){
                if(!this.bootstrapInstance){
                    this.bootstrapInstance = Dialog.init({
                        elementId: "mzModalDialog",
                        hasXButton: false
                    });
                }
            },
            handleDialogSave: function(){
                this.model.trigger('dialogSave');
                this.handleDialogClose();
            },
            handleDialogClose: function(){
                this.model.trigger('dialogClose');
                this.bootstrapInstance.hide();
            },
            handleDialogOpen: function(){
                this.model.trigger('dialogOpen');
                this.bootstrapInstance.show();
            },
            handleDialogCancel: function(){
                this.model.trigger('dialogCancel');
                this.handleDialogClose();  
            },
            render: function() {
                var self = this;
                Backbone.MozuView.prototype.render.apply(this, arguments);
            }
        });
    return ModalDialog;

});
define('modules/checkout/contact-dialog/views-contact-dialog',['modules/backbone-mozu','hyprlive', 'modules/jquery-mozu','underscore', 'hyprlivecontext', 'modules/views-modal-dialog'], function(Backbone, Hypr, $, _, HyprLiveContext, ModalDialogView, CustomerModels) {

    var ContactModalContactView = Backbone.MozuView.extend({
        templateName : "modules/multi-ship-checkout/address-dialog",
         autoUpdate: [
                'firstName',
                'lastNameOrSurname',
                'address.address1',
                'address.address2',
                'address.address3',
                'address.cityOrTown',
                'address.countryCode',
                'address.stateOrProvince',
                'address.postalOrZipCode',
                'address.addressType',
                'phoneNumbers.home',
                'contactId',
                'email'
            ],
            renderOnChange: [
                'address.countryCode'
            ],
        choose: function(e) {
            var idx = parseInt($(e.currentTarget).val(), 10);
            if (idx !== -1) {
                var addr = this.model.get('address');
                var valAddr = addr.get('candidateValidatedAddresses')[idx];
                for (var k in valAddr) {
                    addr.set(k, valAddr[k]);
                }
            }
        }
    });

	var ContactModalView = ModalDialogView.extend({
	   templateName : "modules/multi-ship-checkout/modal-contact",
       handleDialogOpen : function(){
            this.setInit();
            this.model.trigger('dialogOpen');
            this.bootstrapInstance.show();
        },
		handleDialogSave : function(){
            var self = this;
            var checkout = this.model.parent;

             var scrubBillingContactId = function(){
                if(self.model.get('id')) {
                    var isBilling = self.model.get('id').toString().startsWith("billing_");
                    if(isBilling) {
                        self.model.set('id', "");    
                    }
                }
                return self.model;
            };
             

            var saveBillingDestination = function(){
                self.model.messages.reset();
                scrubBillingContactId();
                if(self.model.get('id')) {
                    checkout.get('destinations').get(self.model.get('id')).set('destinationContact',self.model.get('destinationContact'));
                } else {
                    checkout.get('destinations').newDestination(self.model.get('destinationContact'), true, "Billing");
                }
                checkout.get('billingInfo').updateBillingContact(self.model.get('destinationContact'));
                self.model.trigger('closeDialog');
            };


            if(this.model.get('destinationContact').validate()) return false;
            if(this.model.get('destinationContact').get('isBillingAddress')) {

                //checkout.get('destinations').newDestination(this.model.get('destinationContact'));
                saveBillingDestination();
                return;
            }


			var isAddressValidationEnabled = HyprLiveContext.locals.siteContext.generalSettings.isAddressValidationEnabled,
                    allowInvalidAddresses = HyprLiveContext.locals.siteContext.generalSettings.allowInvalidAddresses;

            var addr = this.model.get('destinationContact').get('address');

            var saveShippingDestination = function(){
              self.model.messages.reset();
              scrubBillingContactId();
                if(self.model.get('id')) {
                        self.model.parent.get('destinations').updateShippingDestinationAsync(self.model).ensure(function () {
                             self.model.trigger('closeDialog');
                        });
                } else {
                    self.model.parent.get('destinations').saveShippingDestinationAsync(self.model).then(function(data){
                        var item = checkout.get('items').findWhere({editingDestination: true});
                        if(!item){
                            item = checkout.get('items').at(0);
                        }
                        item.isLoading(true);
                        item.updateOrderItemDestination(data.data.id).then(function(){
                            item.set('editingDestination', false);
                            self.trigger('destinationsUpdate');
                            item.isLoading(false);
                        });
                    }).ensure(function () {
                         self.model.trigger('closeDialog');
                    });
                }
            };

			if(!this.model.validate()) {
            	if (!isAddressValidationEnabled) {
                    saveShippingDestination();
                } else {
                    if (!addr.get('candidateValidatedAddresses')) {
                        var methodToUse = allowInvalidAddresses ? 'validateAddressLenient' : 'validateAddress';
                        addr.syncApiModel();
                        self.model.messages.reset();
                        addr.apiModel[methodToUse]().then(function (resp) {
                            if (resp.data && resp.data.addressCandidates && resp.data.addressCandidates.length) {
                                if (_.find(resp.data.addressCandidates, addr.is, addr)) {
                                    addr.set('isValidated', true);
                                        saveShippingDestination();
                                        return;
                                    }
                                addr.set('candidateValidatedAddresses', resp.data.addressCandidates);
                                self.render();
                            } else {
                                //completeStep();

                                saveShippingDestination();
                            }
                        }, function (e) {
                            if (allowInvalidAddresses) {
                                // TODO: sink the exception.in a better way.
                                self.model.messages.reset();
                                saveShippingDestination();
                            } else {
                                self.model.messages.reset({ message: Hypr.getLabel('addressValidationError') });
                            }
                        });
                    } else {
                        saveShippingDestination();
                    }
                }
			}
		},
        setInit : function(){
            var self = this;
            $.each(this.$el.find('[data-mz-contact-modal-content]'), function(index, val) {

                var contactModalContactView = new ContactModalContactView({
                    el: $(this),
                    model: self.model.get('destinationContact')
                });
                contactModalContactView.render();
            });
        },

        render : function() {
            var self = this;
            self.setInit();
            //Backbone.MozuView.prototype.render.apply(this, arguments);

            // $.each(this.$el.find('[data-mz-contact-modal-content]'), function(index, val) {

            //     var contactModalContactView = new ContactModalContactView({
            //         el: $(this),
            //         model: self.model.get('contact')
            //     });
            //     contactModalContactView.render();
            // });
        }
	});

	return ContactModalView;
});

require(["modules/jquery-mozu",
    "underscore",
    "hyprlive",
    "modules/backbone-mozu",
    "modules/views-messages",
    "modules/cart-monitor",
    'hyprlivecontext',
    'modules/editable-view',
    'modules/preserve-element-through-render',
    'modules/checkout/models-checkout-page',
    'modules/checkout/steps/views-base-checkout-step',
    'modules/checkout/steps/step1/views-shipping-info',
    'modules/checkout/steps/step2/views-shipping-methods',
    'modules/checkout/steps/step3/views-payments',
    'modules/checkout/contact-dialog/views-contact-dialog',
    'modules/amazonpay'],
    function ($, _, Hypr, Backbone, messageViewFactory, CartMonitor, HyprLiveContext, EditableView, preserveElements,
        CheckoutModels, CheckoutStepView, ShippingDestinationsView, ShippingMethodsView, PaymentView, ContactDialogView, AmazonPay) {

    var OrderSummaryView = Backbone.MozuView.extend({
        templateName: 'modules/multi-ship-checkout/checkout-order-summary',
        initialize: function () {
            this.listenTo(this.model.get('billingInfo'), 'orderPayment', this.onOrderCreditChanged, this);
        },

        editCart: function () {
            window.location =  (HyprLiveContext.locals.siteContext.siteSubdirectory||'') + "/cart";
        },

        onOrderCreditChanged: function (order, scope) {
            this.render();
        },

        // override loading button changing at inappropriate times
        handleLoadingChange: function () { }
    });

    var poCustomFields = function() {

        var fieldDefs = [];

        var isEnabled = HyprLiveContext.locals.siteContext.checkoutSettings.purchaseOrder &&
            HyprLiveContext.locals.siteContext.checkoutSettings.purchaseOrder.isEnabled;

            if (isEnabled) {
                var siteSettingsCustomFields = HyprLiveContext.locals.siteContext.checkoutSettings.purchaseOrder.customFields;
                siteSettingsCustomFields.forEach(function(field) {
                    if (field.isEnabled) {
                        fieldDefs.push('purchaseOrder.pOCustomField-' + field.code);
                    }
                }, this);
            }

        return fieldDefs;

    };

    var visaCheckoutSettings = HyprLiveContext.locals.siteContext.checkoutSettings.visaCheckout;
    var pageContext = require.mozuData('pagecontext');


    var CouponView = Backbone.MozuView.extend({
        templateName: 'modules/checkout/coupon-code-field',
        handleLoadingChange: function (isLoading) {
            // override adding the isLoading class so the apply button
            // doesn't go loading whenever other parts of the order change
        },
        initialize: function () {
            var me = this;
            this.listenTo(this.model, 'change:couponCode', this.onEnterCouponCode, this);
            this.codeEntered = !!this.model.get('couponCode');
            this.$el.on('keypress', 'input', function (e) {
                if (e.which === 13) {
                    if (me.codeEntered) {
                        me.handleEnterKey();
                    }
                    return false;
                }
            });
        },
        onEnterCouponCode: function (model, code) {
            if (code && !this.codeEntered) {
                this.codeEntered = true;
                this.$el.find('button').prop('disabled', false);
            }
            if (!code && this.codeEntered) {
                this.codeEntered = false;
                this.$el.find('button').prop('disabled', true);
            }
        },
        autoUpdate: [
            'couponCode'
        ],
        addCoupon: function (e) {
            // add the default behavior for loadingchanges
            // but scoped to this button alone
            var self = this;
            this.$el.addClass('is-loading');
            this.model.addCoupon().ensure(function() {
                self.$el.removeClass('is-loading');
                self.model.unset('couponCode');
                self.render();
            });
        },
        handleEnterKey: function () {
            this.addCoupon();
        }
    });

    var CommentsView = Backbone.MozuView.extend({
        templateName: 'modules/checkout/comments-field',
        autoUpdate: ['shopperNotes.comments']
    });

    var attributeFields = function(){
        var me = this;

        var fields = [];

        var storefrontOrderAttributes = require.mozuData('pagecontext').storefrontOrderAttributes;
        if(storefrontOrderAttributes && storefrontOrderAttributes.length > 0) {

            storefrontOrderAttributes.forEach(function(attributeDef){
                fields.push('orderAttribute-' + attributeDef.attributeFQN);
            }, this);

        }

        return fields;
    };

    var ReviewOrderView = Backbone.MozuView.extend({
        templateName: 'modules/checkout/step-review',
        autoUpdate: [
            'createAccount',
            'agreeToTerms',
            'emailAddress',
            'password',
            'confirmPassword'
        ].concat(attributeFields()),
        renderOnChange: [
            'createAccount',
            'isReady'
        ],
        initialize: function () {
            var me = this;
            this.$el.on('keypress', 'input', function (e) {
                if (e.which === 13) {
                    me.handleEnterKey();
                    return false;
                }
            });
            this.model.on('passwordinvalid', function(message) {
                me.$('[data-mz-validationmessage-for="password"]').text(message);
            });
            this.model.on('userexists', function (user) {
                me.$('[data-mz-validationmessage-for="emailAddress"]').html(Hypr.getLabel("customerAlreadyExists", user, encodeURIComponent(window.location.pathname)));
            });
        },

        submit: function () {
            var self = this;
            _.defer(function () {
                self.model.submit();
            });
        },
        handleEnterKey: function () {
            this.submit();
        }
    });

    var ParentView = function(conf) {
      var gutter = parseInt(Hypr.getThemeSetting('gutterWidth'), 10);
      if (isNaN(gutter)) gutter = 15;
      var mask;
      conf.model.on('beforerefresh', function() {
         killMask();
         conf.el.css('opacity',0.5);
         var pos = conf.el.position();
         mask = $('<div></div>', {
           'class': 'mz-checkout-mask'
         }).css({
           width: conf.el.outerWidth() + (gutter * 2),
           height: conf.el.outerHeight() + (gutter * 2),
           top: pos.top - gutter,
           left: pos.left - gutter
         }).insertAfter(conf.el);
      });
      function killMask() {
        conf.el.css('opacity',1);
        if (mask) mask.remove();
      }
      conf.model.on('refresh', killMask);
      conf.model.on('error', killMask);
      return conf;
    };

    $(document).ready(function () {

        var $checkoutView = $('#checkout-form'),
            checkoutData = require.mozuData('checkout');

        AmazonPay.init(true); 
        checkoutData.isAmazonPayEnable = AmazonPay.isEnabled;

        var checkoutModel = window.order = new CheckoutModels(checkoutData),
            checkoutViews = {
                parentView: new ParentView({
                    el: $checkoutView,
                    model: checkoutModel
                }),
                steps: {
                    shippingAddress: new ShippingDestinationsView({
                        el: $('#step-shipping-address'),
                        model: checkoutModel.get("shippingStep")
                    }),
                    shippingInfo: new ShippingMethodsView({
                        el: $('#step-shipping-method'),
                        model: checkoutModel.get('shippingInfo')
                    }),
                    paymentInfo: new PaymentView({
                        el: $('#step-payment-info'),
                        model: checkoutModel.get('billingInfo')
                    })
                },
                orderSummary: new OrderSummaryView({
                    el: $('#order-summary'),
                    model: checkoutModel
                }),
                couponCode: new CouponView({
                    el: $('#coupon-code-field'),
                    model: checkoutModel
                }),
                comments: Hypr.getThemeSetting('showCheckoutCommentsField') && new CommentsView({
                    el: $('#comments-field'),
                    model: checkoutModel
                }),
                reviewPanel: new ReviewOrderView({
                    el: $('#step-review'),
                    model: checkoutModel
                }),
                messageView: messageViewFactory({ 
                    el: $checkoutView.find('[data-mz-message-bar]'),
                    model: checkoutModel.messages
                }),
                contactDialog: new ContactDialogView({
                    el: $("[mz-modal-contact-dialog]"),
                    model: checkoutModel.get('dialogContact'),
                    messagesEl: $("[mz-modal-contact-dialog]").find('[data-mz-message-bar]')
                })
            };

        window.checkoutViews = checkoutViews;

        checkoutModel.on('complete', function() {
            CartMonitor.setCount(0);
            window.location = (HyprLiveContext.locals.siteContext.siteSubdirectory||'') + "/checkoutv2/" + checkoutModel.get('id') + "/confirmation";
        });



        var $reviewPanel = $('#step-review');
        checkoutModel.on('change:isReady',function (model, isReady) {
            if (isReady) {
                setTimeout(function () { window.scrollTo(0, $reviewPanel.offset().top); }, 750);
            }
        });

        _.invoke(checkoutViews.steps, 'initStepView');
        checkoutViews.contactDialog.render();
        checkoutViews.orderSummary.render();
        $checkoutView.noFlickerFadeIn();


        if (AmazonPay.isEnabled)
            AmazonPay.addCheckoutButton(window.order.id, false);

    });
});

define("pages/multi-ship-checkout", function(){});
