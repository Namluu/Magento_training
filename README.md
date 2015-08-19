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
- Filter very fast
- Remember url by hash

**Technique**
- Magento extension
- Override Layout
- Extend event
- Override Block, Helper

**Limitations**
- Cannot override template set by Abstract Block
app/design/frontend/rwd/default/template/catalog/layer/filter.phtml
app/design/frontend/rwd/default/template/catalog/product/price.phtml
- Need a method to get list attributes to filter
app/design/frontend/rwd/default/template/bc/filter2/catalog/product/list.phtml