<?php
/**
 * @package     BC_Filter
 * @copyright   Copyright (c) http://www.bluecom.com
 * @license     
 */
/**
 * @author Bluecom
 */
class BC_Filter_Model_Resource_Layer_Filter_Attribute extends Mage_Catalog_Model_Resource_Layer_Filter_Attribute 
{
	/**
     * Set the tableAlias name + value
     * Avoid the error define a correlation name more than once
     *
     * @return Mage_Catalog_Model_Layer_Filter_Attribute
     */
	public function applyFilterToCollection($filter, $value)
    {
        $collection = $filter->getLayer()->getProductCollection();
        $attribute  = $filter->getAttributeModel();
        $connection = $this->_getReadAdapter();
        $tableAlias = $attribute->getAttributeCode() . '_idx' . $value[0];
        $conditions = array(
            "{$tableAlias}.entity_id = e.entity_id",
            $connection->quoteInto("{$tableAlias}.attribute_id = ?", $attribute->getAttributeId()),
            $connection->quoteInto("{$tableAlias}.store_id = ?", $collection->getStoreId()),
            $connection->quoteInto("{$tableAlias}.value IN (?)", $value)
        );

        $collection->getSelect()->join(
            array($tableAlias => $this->getMainTable()),
            implode(' AND ', $conditions),
            array()
        )->distinct(true);

        return $this;
    }
}