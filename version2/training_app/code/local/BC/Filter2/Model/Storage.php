<?php
class BC_Filter2_Model_Storage extends Mage_Core_Model_Abstract
{
    /**
     * options will be stored in this array 
     * @var null|array
     */
    protected $_attributes = null;
 
    /**
     * options labels
     * @var null|array
     */
    protected $_options = null;
 
    /**
     * Puts Color options to $_attributes array 
     * @param $collection
     * @return $this
     */
    public function storeData($collection)
    {
        foreach($collection->getItems() as $item){
            if ($color = $item->getColor()){
                $this->_attributes[$item->getParentId()]['color'][$color] = $this->getOptionLabel('color', $color);
            }
            if ($size = $item->getSize()){//echo $item->getParentId();var_dump($this->_attributes[$item->getParentId()]);die;
                $this->_attributes[$item->getParentId()]['size'][$size] = $this->getOptionLabel('size', $size);
            }
        }
        return $this;
    }
 
    /**
     * Retrieves option label by attribute name and value
     * stores all labels in array on first calling 
     * @param $attrName
     * @param $value
     * @return mixed
     */
    public function getOptionLabel($attrName, $value){
        if (!isset($this->_options[$attrName])){
            $attribute = Mage::getModel('eav/config')->getAttribute('catalog_product', $attrName);
            $optArray = $attribute->getSource()->getAllOptions(false);
            foreach($optArray as $item){
                $this->_options[$attrName][$item['value']] = $item['label'];
            }
        }
        //var_dump($value);die;
        return $this->_options[$attrName][$value];
    }
 
    /**
     * Returns options for products 
     * @param product id $id  
     * @param $code
     * @return bool|array
     */
    public function getOptions($id, $code)
    {
        if (isset($this->_attributes[$id][$code])){
            return $this->_attributes[$id][$code];
        }
        return false;
    }
}