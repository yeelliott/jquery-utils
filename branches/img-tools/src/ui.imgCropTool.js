/* jQuery ui.imgTools.js - 0.1
 *
 * (c) Maxime Haineault <haineault@gmail.com>
 * http://haineault.com 
 * 
 * MIT License (http://www.opensource.org/licenses/mit-license.php)
 *
 * TODO:
 *
 *  - focus/blur events: show hide UI
 *  - tabed menu
 *  - implement crop
 * 
 * */

$.ui.log = (typeof(console) != 'undefined')? console.log: function(){};

$.widget('ui.imgTools', {
    plugins: {},
	init: function(){
		var self = this;
        var w    = $(self.element).width();
        var h    = $(self.element).height();

        self.interface = {
            originalWidth:  w,
            originalHeight: h,
            wrapper: $('<div class="ui-imgTools" />').width(w),
            menu:    $('<ul class="ui-imgTools-menu" />'),
            status:  $('<div class="ui-imgTools-status" />').text('status'),
            size:    $('<div class="ui-imgTools-size" />').text(''),
            tools:   $('<div class="ui-imgTools-tools" />').width(w)
        };
        $(self.element).wrap(self.interface.wrapper)
            .hover(function(){ $(this).parent().addClass('hover'); }, function(){ $(this).parent().removeClass('hover'); });
        $(self.interface.tools).insertBefore(self.element)
            .hover(function(){ $(this).parent().addClass('hover'); }, function(){ $(this).parent().removeClass('hover'); });
        $(self.interface.menu).insertBefore(self.interface.tools)
            .hover(function(){ $(this).parent().addClass('hover'); }, function(){ $(this).parent().removeClass('hover'); });
        self.propagate('init', {}, self);
        self.open();
    },
    ui: function(inst) {
        return {
            options:     (inst || this)['options'],
            element:     (inst || this)['element'],
            interface:   (inst || this)['interface'],
            plugins:     (inst || this)['plugins'],
            addMenuItem: (inst || this)['addMenuItem']
        };
    },
    
    open: function() {
        var self    = this;
        $(self.element).addClass('ui-imgTools-cropping');
        $(self.interface.wrapper).slideDown();
        self.propagate('open', {}, self);
    },

    propagate: function(n, e, inst, noPropagation) {
        $.ui.plugin.call(this, n, [e || {}, this.ui(inst)]);
    },
    addMenuItem: function(k, label, callback) {
        var i = $('<li><a href="#%k">%l</a></li>'.replace('%k',k).replace('%l',label)).click(callback);
        $(this.interface.menu).append(i);
    }
});


$.extend($.ui.imgTools, {
    getter:   '',
    regional: [],
    defaults: {
        mode:      'dialog',
        minWidth:  false,
        minHeight: false,
        resize:    true

        
    }
});

$.ui.imgTools.regional[''] = {
    crop:   'crop',
    resize: 'resize',
    save:   'apply',
    cancel: 'cancel'
};

/*
 * imgSelection plugins
 */
$.ui.plugin.add('imgTools', 'resize', {
    init: function(e, ui){
        self = ui;
        var resize = $('<div class="ui-imgTools-resize" />').hide();
        var slider = $('<div class="ui-slider"><div class="ui-slider-handle" /></div>').slider();
        var save   = $('<input type="button" value="Save" />');
        var cancel = $('<input type="button" value="Cancel" />');
        self.addMenuItem('resize', 'Resize', function(){
            $(self.interface.menu).hide();
            $(resize).show();
            $(slider).slider('moveTo', 100, 0, true);
        });
        
        $(self.interface.tools).append($(resize).append(slider, save, cancel));

        $(save).bind('click', function(e){});
        $(cancel).bind('click', function(e){
            var w = parseInt(self.interface.originalWidth, 10);
            $(self.element).add($(self.element).parent()).width(w);
            if (w > 340) {
                $(self.interface.tools).width(w);
            }
            $(resize).hide();
            $(self.interface.menu).show();
        });
        $(slider).bind('slide', function(e, ui){ 
            var w = parseInt(self.interface.originalWidth * ui.value / 100, 10);
            $(self.element).add($(self.element).parent()).width(w);
            if (w > 340) {
                $(self.interface.tools).width(w);
            }
        });
    }
});


/* English (UTF-8) initialisation for the jQuery UI imgTools plugin. */
/* Written by Maxime Haineault (haineault@gmail.com). */
jQuery(function($){
	$.ui.imgTools.regional['fr'] = {
            crop:   'cadrer',
            resize: 'redimenssioner',
            save:   'appliquer',
            cancel: 'annuler'
    };
	//$.ui.imgTools.setDefaults($.ui.imgTools.regional['fr']);
});
