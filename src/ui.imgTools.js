/* jQuery ui.imgTools.js - 0.1a
 *
 * (c) Maxime Haineault <haineault@gmail.com>
 * http://haineault.com 
 * 
 * MIT License (http://www.opensource.org/licenses/mit-license.php)
 *
 * TODO:
 * - when a plugin is active UI should stay at opacity 1.0
 * - crop: initial area should be focused
 * - crop: add preview coordinate
 * - crop: selection containment isn't respected (possibly a bug in jQuery resizable)
 * - crop: when activated inline it becomes a block element, making the text jump
 * - crop: make save work
 * - crop: image opacity isn't reseted after plugin destroy
 * - crop: overlay doesn't play well with resize
 * - resize: when re-resizing if cancel is pressed the wrong "original" width is restored
 * */

$.widget('ui.imgTools', {
    plugins: {},
	init: function(){
		var self = this;

        self.actions = {
            history: [],
            set: function(action, unique){
                var actions = self.actions.get(action.plugin);
                // if more than one action and unique true 
                if (actions.length >= 1 && unique) {
                    self.actions.history = $.map(self.actions.history, function(entry, i) {
                        if (entry.plugin == action.plugin) return action;
                        else return entry;
                    });
                }
                else {
                    self.actions.add(action);
                }
                self.propagate('updated', self);
            },
            get: function(plugin){
                return $.map(self.actions.history, function(entry, i) {
                    if (entry.plugin == plugin) return entry;
                });
            },
            add: function(action) {
                self.actions.history.push(action);
            }
        };

        self.state = {
            initial: {
                width:  $(self.element).width(),
                height: $(self.element).height()
            }
        };

        self.interface = {
            wrapper: $('<div class="ui-imgTools" />'),
            menu:    $('<ul class="ui-imgTools-menu" />'),
            status:  $('<div class="ui-imgTools-status" />').text('status'),
            size:    $('<div class="ui-imgTools-size" />').text(''),
            tools:   $('<div class="ui-imgTools-tools" />').hide()
        };
        $(self.element).add(self.interface.tools).add(self.interface.tools).wrap(self.interface.wrapper)
            .hover(function(){ $(this).parent().addClass('hover'); }, function(){ $(this).parent().removeClass('hover'); });
        $(self.interface.menu).insertBefore(self.element);
        $(self.interface.tools).insertAfter(self.interface.menu);
        self.open();
        $(self.element).data('imgTools', this);
        self.propagate('init', {}, self);
    },

    ui: function(inst) {
        return {
            options:     (inst || this)['options'],
            element:     (inst || this)['element'],
            plugins:     (inst || this)['plugins']
        };
    },

    propagate: function(n, e, inst) {
        $.ui.plugin.call(this, n, [e || {}, this.ui(inst)]);
    },

    getSearchHash: function() {
        var self  = this;
        var out   = {};
        var match = $(self.element).attr('src').match(/\?(.*)$/);
        if (match[1]) {
            var tokens =  match[1].split('&');
            $.each(tokens, function(){
                var pair = this.split('=');
                out[pair[0]] = pair[1];
            });
        }
        return out;
    },

    getSearchString: function(){
        var self = this;
        return $.map(self.actions.history, function(entry, i) {
            return '%k=%v'.replace('%k', entry.plugin).replace('%v', entry.val);
        }).join('&');
    },

    open: function() {
        var self = this;
        $(self.interface.wrapper).slideDown();
        self.propagate('open', {}, self);
    },

    // same as $.ui.plugin.call but propagate only to the specified plugin
    callPlugin: function(plugin, name, args) {
        var self = this;
        var set = self.plugins[name];
        if (!set) { return; } 
        for (var i = 0; i < set.length; i++) { 
            if (self.options[set[i][0]] && set[i][0] == plugin) { 
                set[i][1].apply(self.element, args || []); 
            } 
        }
    },

    addButton: function(plugin, button, label, method) {
        var self = this;
        if (self.interface[plugin]) {
            self.interface[plugin][button] = $('<input type="button" />').val(label)
                .bind('click', function(e){
                    if (self.plugins[method]) {
                        var rs = jQuery.grep(self.plugins[method], function(n){
                            return (n[0] && n[0] == plugin);
                        }).shift();
                        if (rs && rs[1]) {
                            rs[1].apply(this, [e, self])
                        }
                    }
                }).appendTo(self.interface[plugin].wrapper);
        }
    },

    addMenuItem: function(plugin, label, method) {
        var self = this;
        $(this.interface.menu).append($('<li><a href="#%k">%l</a></li>'.replace('%k',plugin).replace('%l',label))
            .click(function(e){
                if (self.plugins[method]) {
                    var rs = jQuery.grep(self.plugins[method], function(n){
                        return (n[0] && n[0] == plugin);
                    }).shift();
                    if (rs && rs[1]) {
                        rs[1].apply(this, [e, self])
                    }
                }
                if (self.interface[plugin] && self.interface[plugin].wrapper) {
                    $(self.interface[plugin].wrapper).show('fast');
                    $(self.interface.wrapper).addClass('ui-imgTools-active');
                    $(self.interface.menu).fadeOut('fast');
                    $(self.interface.tools).fadeIn('slow'); 
                }
            }));
    },
});

$.extend($.ui.imgTools, {
    getter:   '',
    regional: [],
    defaults: {
        url:       'data/ImgTools.php',
        mode:      'dialog',
        minWidth:  false,
        minHeight: false,
        history:   true,
        scale:     true,
        crop:      true,
        plugins: {
            crop: {
                areaInfo: true
            }
        }
    }
});

$.ui.imgTools.regional[''] = {
    crop:   'crop',
    scale:  'scale',
    save:   'apply',
    cancel: 'cancel'
};

/*
 * imgSelection plugins
 */
$.ui.plugin.add('imgTools', 'scale', {
    activate: function(e, ui) {
        var self    = $(ui.element).data('imgTools');
        var actions = self.actions.get('scale');
        var img     = self.getSearchHash();
        setTimeout(function(){
            if (actions.length > 0) {
                $(self.interface.scale.slider).slider('moveTo', actions.shift().val, 0, true);
            }
            else {
                $(self.interface.scale.slider).slider('moveTo', 100, 0, true);
            }
        }, 300);
    },
    deactivate: function(e, ui, noresize) {
        var self = $(ui.element).data('imgTools');
        $(self.interface.scale.wrapper).hide();
        $(self.interface.tools).fadeOut();
        $(self.interface.menu).fadeIn();
        if (!noresize) {
            $(self.element).animate({
                width: parseInt(self.state.initial.width, 10)});
        }
    },
    save: function (e, ui){
        var self = $(ui.element).data('imgTools');
        var getStr = self.getSearchString();
        self.actions.set({label: 'Scale', plugin: 'scale', val: $(self.interface.scale.slider).slider('value')}, true);
        $(self.element).attr('src', self.options.url + ((getStr && '?'+getStr+'&img=' || '?img=') + self.getSearchHash().img));
        self.callPlugin('scale', 'deactivate', [e, ui, true]);
    },
    init: function(e, ui){
        console.log(ui.element);
        var self = $(ui.element).data('imgTools');
        console.log(self);
        self.interface.scale = {
            wrapper: $('<div class="ui-imgTools-scale ui-imgTools-plugin" />').hide('fast'),
            slider: $('<div class="ui-slider"><div class="ui-slider-handle" /></div>').slider()
        };

        $(self.interface.scale.wrapper)
            .append(self.interface.scale.slider)
            
        $(self.interface.tools).append(self.interface.scale.wrapper);
        self.addMenuItem('scale', 'Scale', 'activate');
        self.addButton('scale', 'save', 'Ok', 'save');
        self.addButton('scale', 'cancel', 'Cancel', 'deactivate');
        $(self.interface.scale.slider).bind('slide', function(e, ui){ 
            $(self.element).width(parseInt(self.state.initial.width * ui.value / 100, 10));
        });
    }
});

$.ui.plugin.add('imgTools', 'crop', {
    init: function(e, ui){
        var self = $(ui.element).data('imgTools');
        self.interface.crop = {
            wrapper: $('<div class="ui-imgTools-crop ui-imgTools-plugin" />').hide('fast')
        };
        $(self.interface.tools).append(self.interface.crop.wrapper);
        self.addMenuItem('crop', 'Crop',   'activate');
        self.addButton('crop',   'save',   'Save',   'save');
        self.addButton('crop',   'cancel', 'Cancel', 'deactivate');
    },
    activate: function(e, ui) {
        var self = $(ui.element).data('imgTools');
        $(self.interface.wrapper).addClass('ui-imgTools-active');
        $(self.interface.menu).fadeOut();
        $(self.interface.tools).fadeIn(); 
        $(self.element).imgSelection(self.options.plugins.crop);
    },
    deactivate: function(e, ui){
        var self = $(ui.element).data('imgTools');
        var w  = parseInt(self.state.initial.width, 10);
        $(self.interface.wrapper).removeClass('ui-imgTools-active');
        $(self.interface.tools).fadeOut();
        $(self.interface.menu).fadeIn();
        $(self.interface.crop.wrapper).hide();
        $(self.element).imgSelection('destroy');
    },
    save: function (e, ui){
        var self   = $(ui.element).data('imgTools');
        var s      = $(self.element).imgSelection('getSelections')[0];
        self.actions.set({label: 'Crop', plugin: 'crop', val: [s.x, s.y, s.w, s.h].join(',')}, true);
        var getStr = self.getSearchString();
        $(self.element).attr('src', self.options.url + ((getStr && '?'+getStr+'&img=' || '?img=') + self.getSearchHash().img));
        self.callPlugin('scale', 'deactivate', [e, ui, true]);
    }
});

$.ui.plugin.add('imgTools', 'history', {
    init: function(e, ui){
        var self = $(ui.element).data('imgTools');
        self.interface.history = {
            wrapper: $('<ol class="ui-imgTools-history" />')
        };
        $(self.interface.history.wrapper).insertAfter(self.element);
    },
    updated: function(e, ui) {
        var self = $(ui.element).data('imgTools');
        $(self.interface.history.wrapper).empty();
        $.each(self.actions.history, function(i, entry){
            $('<li class="ui-imgTools-history-entry" />')
                .text('%l: %v'.replace('%l', entry.label).replace('%v', entry.val))
                .appendTo(self.interface.history.wrapper);
        });
    }
});

/* English (UTF-8) initialisation for the jQuery UI imgTools plugin. */
/* Written by Maxime Haineault (haineault@gmail.com). */
jQuery(function($){
	$.ui.imgTools.regional['fr'] = {
            crop:   'cadrer',
            scale:  'redimenssioner',
            save:   'appliquer',
            cancel: 'annuler'
    };
	//$.ui.imgTools.setDefaults($.ui.imgTools.regional['fr']);
});
