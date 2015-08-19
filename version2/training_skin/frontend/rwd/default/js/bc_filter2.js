(function($) {
    var filter;
    filter = {
        items: [],
        hashItems: [],
        rangesSet: false,
        attributeRanges: {},
        attributeRangesSet: false,
        products: null,
        matched: null,
        matches: {},
        whereStr: $('span#where-str').html(),
        handleClick: function (clicked) {
            var search = clicked.data('attr-val');
            var hashVal = clicked.attr('href').split('?')[1];

            // have we already seen this filter?
            var exist = filter.items.indexOf(search);
            if (exist == -1) {
                filter.items.push(search);     // no, so add it to the list
            } else {
                filter.items.splice(exist, 1); // we already have this filter, so remove it to toggle it off
            }

            // have we already seen this hash value?
            var exist = filter.hashItems.indexOf(hashVal);
            if (exist == -1) {
                filter.hashItems.push(hashVal);     // no, so add it to the list
            } else {
                filter.hashItems.splice(exist, 1); // we already have this filter, so remove it to toggle it off
            }

            if (filter.items.length == 0) {     // no filters, nothing to do
                filter.products.show();
                return;
            }
            filter.filterProducts();            // actually do the filtering
        },
        filterProducts: function () {
            // this is where we will store our parameter matches (gets populated with arrays below)
            filter.matches = {};

            filter.setRanges();

            // COLLECT MATCHING ITEMS FROM THE DOM
            var l = filter.items.length;
            for (var i = 0; i < l; i++) {
                var arr = filter.items[i].split('='); // split the filter into key=val
                var key = arr[0];
                var val = arr[1];

                // if we haven't seen this filter parameter before, create a storage area for the matches
                if(!filter.matches.hasOwnProperty(key)) {
                    filter.matches[key] = [];
                }

                // get matching product-item IDs from our various filter maps
                // we need to check whether the attribute range exists because we might not have availability data yet
                if(typeof filter.attributeRanges[key] !== "undefined") {
                    filter.matches[key].push(filter.attributeRanges[key][val]);
                }
            }

            // flatten matches array within parameter groups and apply OR combination within the same groups
            for(var key in filter.matches) {
                if(filter.matches.hasOwnProperty(key)) {
                    filter.matches[key] = _.union.apply(this, filter.matches[key]);
                }
            }

            // now take the intersection (AND) of all the parameter group matches
            filter.matched = _.intersection.apply(this, _.toArray(filter.matches));

            // hide everything
            filter.products.hide();

            // and now show matching elements
            var a = filter.products.filter(function(){
                return _.contains(filter.matched, $(this).attr('data-id'));
            }).fadeIn(150);

        },
        setRanges: function() {
            if(filter.rangesSet == false) {
                // we have to create data structures that map filters to the product-item DOM objects
                // we only do this once because it's somewhat expensive
                filter.setPriceRanges();
                //filter.setDateRanges();
                filter.setAttributeRanges();
                filter.rangesSet = true;
            }
        },
        setPriceRanges: function() {
            if(typeof filter.attributeRanges['price'] == 'undefined') {
                var products = $('div.category-products');    // using this multiple times
                var hi, lo, lohi, range, price;
                filter.attributeRanges['price'] = {};

                // get price value steps
                $('ol.refines-item-price a').each(function () {
                    range = $(this).data('attr-val').split('=')[1];
                    filter.attributeRanges['price'][range] = [];

                    // we always price in whole units of currency without pence or cents, and even if we didn't, things like 249.99 would be less than 250
                    lohi = range.match(/^(\d*)-(\d*)$/);
                    lo = parseInt(lohi[1]);
                    hi = parseInt(lohi[2]);
                    if (isNaN(lo)) lo = 0;
                    if (isNaN(hi)) hi = 10000000;

                    // regular products with a single price
                    products.find('span[itemprop="price"], span[itemprop="lowPrice"], span[itemprop="highPrice"]').filter(function (i, el) {
                        price = parseInt($(this).attr('content'));
                        return price >= lo && price <= hi;
                    }).each(function () {
                        filter.attributeRanges['price'][range].push($(this).parentsUntil('.item').parent().attr('data-id'));
                    });

                    filter.attributeRanges['price'][range] = _.uniq(filter.attributeRanges['price'][range]); // only necessary with price ranges
                });
            }
        },
        setAttributeRanges: function() {
            if(filter.attributeRangesSet == false) {
                $('ol.refines-item').not('.refines-item-cat').not('.refines-item-price').not('.refines-item-availability_filter').each(function () {
                    var attr = $(this).attr('class').match(/refines-item-(\w+)/)[1];
                    filter.attributeRanges[attr] = {};
                    $('ol.refines-item-' + attr + ' a').each(function () {
                        var val = $(this).data('attr-val').split('=')[1];
                        // filter product based on data attributes in product DOM li.item
                        filter.attributeRanges[attr][val] = filter.products.filter('[data-' + attr + '~="' + val + '"]').map(function () {
                            return $(this).attr('data-id');
                        }).get();
                    });
                });
                filter.attributeRangesSet = true;
            }
        },
        /*reflow: function() {
            var noResultMessage = $('.cat-noresultmsg').addClass('hide');
            var productContainer = $('.mb-category-products').removeClass('hide');

            $('.category-products > .row_divider').remove();
            $('.category-products > .clearer').remove();

            var visible = $('.category-products > .col-xs-8:visible');
            visible.each(function(index) {
                if ((index + 1) % filter.numCols == 0) {
                    if((index + 1) != visible.length) {
                        $(this).after('<div class="clearer"></div><div class="row_divider"></div>');
                    } else {
                        $(this).after('<div class="clearer">'); // only for the last element
                    }
                }
            });

            //if no product is visible display an error message and hide the top and bottom toolbars
            if(visible.length === 0) {
                noResultMessage.removeClass('hide');
                productContainer.addClass('hide');
            }
        },*/
        postFiltering: function() {
            //filter.reflow();
            filter.updateHash();
            filter.disableRedundant();
        },
        updateHash: function() {
            var l = filter.hashItems.length;
            if(l == 0) {
                window.location.hash = '-';
                return;
            }
            var filterTypes = {};
            var arr;
            var key;
            var val;
            for (var i = 0; i < l; i++) {
                arr = filter.hashItems[i].split('='); // split the filter into key=val
                key = arr[0];
                val = arr[1];
                if(!filterTypes.hasOwnProperty(key)) {
                    filterTypes[key] = [];
                }
                filterTypes[key].push(val);
            }
            var hash = '#' + filter.whereStr;
            for(var item in filterTypes) {
                hash += '/' + item + '/' + filterTypes[item].join('_');
            }

            window.location.hash = hash;
        },
        disableRedundant: function() {
            if (filter.items.length == 0) {     // no filters, nothing to do
                $('a.filter-disabled').removeClass('filter-disabled');
                return;
            }
            // The logic for working out which filter checkboxes to disable is a bit complicated, please see below
            var parameterGroups, filteredParameterGroups;
            parameterGroups = _.keys(filter.attributeRanges); // this is all of the currently availabile filter parameters

            // we need as many match groups as we have parameter groups with selections in them
            // (a "parameter group" is colour, style, price etc.)

            // This is because when determining which checkboxes to deactivate we need to consider a set of matches that
            // excludes the current parameter group - e.g. when deciding which colour filters to deactivate, we only want
            // to consider the product match set that is generated by other filters (price, style etc)
            var matchesWithoutParameterGroups = {};

            _.each(parameterGroups, function(group) {
                var filtersWithoutGroup = {};
                // flatten matches array within parameter groups and apply OR combination within the same groups
                for(var key in filter.matches) {
                    if(key != group) {
                        filtersWithoutGroup[key] = filter.matches[key];
                    }
                }
                // now take the intersection (AND) of all the parameter group matches
                matchesWithoutParameterGroups[group] = _.intersection.apply(this, _.toArray(filtersWithoutGroup));
            });

            filteredParameterGroups = _.uniq($.map(filter.items, function(element){
                return element.split('=')[0]
            }));

            // We have a special case for where there are only filters from one parameter group (e.g. colour) selected.
            // In this case we do not want to disabled ANY filters from that parameter group

            // we need to do this explicitly because otherwise clicking on a colour (e.g. pink) would automatically
            // disable filters for all other colours, which is not what you want.

            // (whereas, if you had other filter parameters selected outside of colour (e.g. price = 0 - 250)
            // you only want to show those colour filters which have products in the 0 - 250 range)
            var parameterGroupToSkip = '';  // default nothing - parameter names will not match this
            if(filteredParameterGroups.length == 1) {
                parameterGroupToSkip = filteredParameterGroups[0]; // skip disabling filters in this parameter group
            }

            // now work out what filterLinks to actually disable
            var filtersToDisable = [];
            var attr;
            $('ol.refines-item:not(.refines-item-cat) a').each(function () {

                attr = $(this).data('attr-val').split('=');
                if(attr[0] == parameterGroupToSkip) {  // this is our special case, see above
                    return;
                }

                // we may not have availability yet
                if(!filter.attributeRanges.hasOwnProperty(attr[0])) {
                    return;
                }

                if(0 == _.intersection(filter.attributeRanges[attr[0]][attr[1]], matchesWithoutParameterGroups[attr[0]]).length) {
                    filtersToDisable.push($(this).data('attr-val'));
                }
            });

            // Now disable the filterLinks marked as for disabling
            var filterLinks = $('ol.refines-item a');
            filterLinks.not('.filter-always-disabled').toggleClass('filter-disabled', false);

            _.each(filtersToDisable, function(value){
                filterLinks.filter('[data-attr-val="'+value+'"]').not('.filter-checkbox-checked').toggleClass('filter-disabled', true);
            });
        },
        loadHash: function() {
            //filter.setCountryCode();
            if(window.location.hash.length > 3) {

                var layeredNav = $('.refines-layered-nav');
                var h = window.location.hash.split('/');
                h.shift();
                var l = h.length;

                for(var i = 0; i < l; i += 2) {
                    $.each(h[i+1].split('_'), function(j, val) {
                        filter.hashItems.push(h[i] + '=' + val);
                    });
                }

                var foundHashItems = [];
                $.each(filter.hashItems, function(i, val) {
                    layeredNav.find('a[href$="'+val+'"]').each(function(){
                        foundHashItems.push(val);
                        filter.items.push($(this).data('attr-val'));
                        $(this).toggleClass('filter-checkbox-checked').toggleClass('filter-checkbox-unchecked');
                    });
                });
                filter.hashItems = foundHashItems; // bogus things in the hash will now be gone
            }
        }
    };

    filter.loadHash();
    //filter.loadAvailability();

    $(document).ready(function(){
        filter.products = $('div.category-products li.item');

        var filtered = 0;
        if(filter.items.length) {
            filtered ++;
            filter.filterProducts();
        }
        if(filtered > 0) {
            filter.postFiltering();
        }
        filter.loaded = true;

        // activate filter click handling
        $('.refines-layered-nav').on('click', 'a:not(.filter-category)', function(event) {
            // IE8, IE9 do not support pointer-events: none
            if($(this).hasClass('filter-disabled')) {
                return false;
            }
            try {
                filter.handleClick($(this));
                $(this).toggleClass('filter-checkbox-checked').toggleClass('filter-checkbox-unchecked');
                filter.postFiltering();
            } catch (exception) {
                console.log(exception);
            }

            event.preventDefault();
        });
    });
})(jQuery);