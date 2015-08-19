#Magento training Aug 2015

### Version 1

**Features**
- Multiple layered navigation filter extension
- No core code changes
- Works with any attribute filter

**Technique**
- Magento extension
- Override Model, Model Resource

### Version 2
[Demo](http://10.87.1.77/mage_training/women/new-arrivals.html)

**Features**
- Multiple layered navigation filter extension
- Filter works very fast, don't load collection again
- Remember status filter by hash on URL

**Technique**
- Magento extension
- Override Layout
- Extend event
- Override Block, Helper

**Limitations**
- Cannot override template set by Abstract Block
app/design/frontend/rwd/default/template/catalog/layer/filter.phtml
app/design/frontend/rwd/default/template/catalog/product/price.phtml
```
So I have to override these files of rwd theme
```

- Need a method to get list attributes to filter
app/design/frontend/rwd/default/template/bc/filter2/catalog/product/list.phtml
```html
<li data-color="<?php echo $color ?>" data-id="<?php echo $_product->getId() ?>" data-price="<?php echo $_product->getPrice() ?>" data-material="<?php echo $_product->getMaterial() ?>"...
```

- Filter doesn't work with pagination, ordering

### Note
We have to config to disable the configurable swatches product:
System > Configuration > Catalog (left nav) > Configurable Swatches > General Settings > Enabled = No
