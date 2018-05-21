<?php

require_once('rdsm_api.php');

class RDSMConversionsAPI {
  private $api_client;

  const DEFAULT_REQUEST_ARGS = array(
    'timeout' => 10,
    'headers' => array('Content-Type' => 'application/json')
  );

  function __construct($conversion) {
    $api = new RDSMAPI(LEGACY_API_URL);
    $this->api_client = $api;
    $this->conversion = $conversion;
  }

  public function create_lead_conversion() {
    if($this->conversion->valid_payload()) {
      $body = array('body' => json_encode($this->conversion->form_data));
      $args = array_merge(DEFAULT_REQUEST_ARGS, $body);

      $response = $this->api_client->post(CONVERSIONS, $args);

      if (is_wp_error($response)) {
        unset($this->conversion->form_data);
      }

      return $response;
    }
  }
}