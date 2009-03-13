/*
  jQuery ui.hygrid.colhider
  http://code.google.com/p/jquery-utils/

  (c) Maxime Haineault <haineault@gmail.com> 
  http://haineault.com

  MIT License (http://www.opensource.org/licenses/mit-license.php

*/

$.tpl('colhider.menu',     '<ul class="ui-hygrid-p-colhider-menu ui-helper-hidden ui-helper-reset" />');
$.tpl('colhider.menuItem', '<li class="ui-corner-all ui-helper-reset"><label><input type="checkbox" /> {label:s}</label></li>');

$.ui.plugin.add('hygrid', 'colhider', {
    rowinserted: function(e, ui) {
        ui.insertedRow.append('<td>&nbsp;</td>');
    },
    coltoggled: function(e, ui) {
        if (ui.options.width == 'auto') {
            ui._trigger('resized');
        }
    },
    initialized: function(e, ui) {
        ui.options = $.extend({colhider: true}, ui.options);

        $.extend($.ui.hygrid.cellModifiers, {
            hide:  function(el, cell, type){ 
                if (cell.hide) { el.hide(); } 
            }
        });
        
        if (ui.options.colhider) {
            ui._dom('colhidermenu ', $.tpl('colhider.menu').prependTo(ui._dom('wrapper')));
            var thead = ui._dom('thead');
            var tbody = ui._dom('tbody');
            var menu  = ui._dom('colhidermenu ');
            ui._fixCellIndex = ui._fixCellIndex + 1;
            $th = thead.find('th');
            // create menu
            $th.slice(0, $th.length).each(function(i){
                var e   = $.Event();
                var lbl = $(this).find('div:first-child').text();
                $.tpl('colhider.menuItem', {label: lbl})
                    .data('colindex', i)
                    .bind('click.colhider', function(){
                        var $self = $(this);
                        var menu  = $self.parents('ul');
                        ui.toggledCol = ui.col($self.data('colindex'));
                        if ($self.find('input:checked').length > 0) {
                            ui.toggledCol.show();
                        }
                        else {
                            ui.toggledCol.hide();
                        }
                        setTimeout(function() {
                            menu.hide();
                            ui._trigger('coltoggled');
                        }, 100); // let the user see the check mark before hiding
                    })
                    .find('input')
                        .attr('checked', !ui._getColOptions(i, 'hide')).end()
                    .appendTo(menu);
            });
            // create button
            $('<th class="ui-hygrid-p-colhider ui-state-default"><span class="ui-icon ui-icon-gridmenu" />').width(16)
                .bind('click.colhider', function() {
                    menu.css({
                        top: tbody.position().top,
                        left: $(this).position().left
                    }).toggle();
                })
                .hover(function(){ $(this).addClass('ui-state-hover');}, 
                       function(){ $(this).removeClass('ui-state-hover'); 
                }).appendTo(thead.find('tr'));
        }
    }
});