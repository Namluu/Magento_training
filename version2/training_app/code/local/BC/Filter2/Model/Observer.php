<?php
class BC_filter2_Model_Observer
{
    /**
     * Checks if needed collection catched and passes it to Storage Model to store options
     * @param $observer
     * @return $this
     */
    public function storeAttributes($observer)
    {
        $collection = $observer->getCollection();
        if ($collection instanceof Mage_Catalog_Model_Resource_Product_Type_Configurable_Product_Collection)
        {
            $storageModel = Mage::getSingleton('bc_filter2/storage');
            $storageModel->storeData($collection);
        }
        return $this;
    }
}
