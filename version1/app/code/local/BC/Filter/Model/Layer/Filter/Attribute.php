<?php
/**
 * @package     BC_Filter
 * @copyright   Copyright (c) http://www.bluecom.com
 * @license     
 */
/**
 * Model possible or applied multiple filters which is based on an attribute
 * @author Bluecom
 */
class BC_Filter_Model_Layer_Filter_Attribute extends Mage_Catalog_Model_Layer_Filter_Attribute
{
	/**
     * Apply attribute option filter to product collection
     * Don't reset the selected attribute - can select multiple attributes
     *
     * @return Mage_Catalog_Model_Layer_Filter_Attribute
     */
	public function apply(Zend_Controller_Request_Abstract $request, $filterBlock)
    {
        $filter = $request->getParam($this->_requestVar);
        if (is_array($filter)) {
            return $this;
        }
        // MP customized
        $filter = explode('_', $filter);
        if (count($filter) < 1 || $filter == '') {
            return $this;
        }

        if (count($filter) == 1) {
            $filter = $filter[0];
        }

        if ($filter) {
            $this->_initItems();
            $this->_getResource()->applyFilterToCollection($this, $filter);
            $text = '';
            
            if (count($filter) == 1) {
                $text = $this->_getOptionText($filter);
            } else {
            	foreach ($filter as $att) {
	                ($text == '') ? $text = $this->_getOptionText($att) : $text .= ', '.$this->_getOptionText($att);
	            }
            }
            $this->getLayer()->getState()->addFilter($this->_createItem($text, $filter));
        }
        // End MP customized

        /*$text = $this->_getOptionText($filter);
        if ($filter && strlen($text)) {
            $this->_getResource()->applyFilterToCollection($this, $filter);
            $this->getLayer()->getState()->addFilter($this->_createItem($text, $filter));
            //$this->_items = array();
        }*/
        return $this;
    }

    public function getMSelectedValues()
    {
        // seperate param string

        $values = $this->sanitizeRequestNumberParam(
            $this->_requestVar,
            array(array('sep' => '_', 'as_string' => true))
        );

        return $values ? array_filter(explode('_', $values)) : array();
    }
    public function sanitizeNumber($input, $separators = array()) {
        if (count($separators)) {
            $separator = array_shift($separators);
            if (!is_array($separator)) {
                $separator = array('sep' =>$separator);
            }
            $result = array();
            foreach (explode($separator['sep'], $input) as $value) {
                if (($sanitizedValue = $this->sanitizeNumber($value, $separators)) !== false && $sanitizedValue !== '' &&  $sanitizedValue !== null) {
                    $result[] = $sanitizedValue;
                }
            }
            if (!empty($separator['as_string'])) {
                return implode($separator['sep'], $result);
            }
            else {
                return $result;
            }
        }
        else {
            return is_numeric($input) ? $input : null;
        }
    }
    public function sanitizeRequestNumberParam($paramName, $separators = array()) {
        $param = $this->sanitizeNumber(urldecode(
            preg_replace('/__\d__/', '', Mage::app()->getRequest()->getParam($paramName))),
            $separators);
        if (isset($_GET[$paramName])) {
            if (trim($param) === '' || trim($param) === null) {
                unset($_GET[$paramName]);
            }
            else {
                $_GET[$paramName] = $param;
            }
        } else {
            if (trim($param) === '' || trim($param) === null) {
                Mage::app()->getRequest()->setParam($paramName, null);
            } else {
                Mage::app()->getRequest()->setParam($paramName, $param);
            }
        }
        return $param;
    }
}