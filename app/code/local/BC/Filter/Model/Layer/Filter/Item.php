<?php
class BC_Filter_Model_Layer_Filter_Item extends Mage_Catalog_Model_Layer_Filter_Item
{
	/**
     * Get filter item url
     *
     * @return string
     */
    public function getUrl()
    {
        // append the param attribute for multiple selection
        $values = $this->getFilter()->getMSelectedValues();
        if (!$values) $values = array();
        if (!in_array($this->getValue(), $values)) $values[] = $this->getValue();

        $query = array(
            $this->getFilter()->getRequestVar()=>implode('_', $values),
            Mage::getBlockSingleton('page/html_pager')->getPageVarName() => null // exclude current page from urls
        );
        return Mage::getUrl('*/*/*', array('_current'=>true, '_use_rewrite'=>true, '_query'=>$query));
    }

}