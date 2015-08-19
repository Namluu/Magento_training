<?php
class BC_Filter2_Helper_Data extends Mage_Core_Helper_Abstract
{
    protected $_storageModel = null;
 
    public function  __construct()
    {
        $this->_storageModel = Mage::getSingleton('bc_filter2/storage');
    }
 
    /**
     * gets options from storage and generates string
     * @param $id
     * @param $code
     * @return string
     */
    public function getConfigurableProductAttributeOptions($id, $code)
    {
        $values = $this->_storageModel->getOptions($id, $code);
        if ($values){
            //return implode(', ',$values);
            return implode(' ',array_keys($values));
        }
        return '';
    }
}