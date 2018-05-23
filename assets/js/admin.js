(function RDStationIntegration() {
  var SERVER_ORIGIN = 'https://je5ypxtc6b.execute-api.us-west-2.amazonaws.com';
  var CLIENT_ID = 'c9d14ec8-2671-404e-b337-ebae63906a8b';
  var REDIRECT_URL = 'https://je5ypxtc6b.execute-api.us-west-2.amazonaws.com/dev/oauth/callback';
  var LEGACY_TOKENS_ENDPOINT = 'https://api.rd.services/platform/legacy/tokens';
  var AUTHENTICATION_ENDPOINT = 'https://api.rd.services/auth/dialog';
  var newWindowInstance = null;

  function oauthIntegration(message) {
    if (message.origin === SERVER_ORIGIN) {
      persist(message);

      if (newWindowInstance) {
        newWindowInstance.close();
      }
    }
  }

  function bindConnectButton() {
    var button = document.querySelector('.rd-oauth-integration');
    button.addEventListener('click', function () {
      newWindowInstance = window.open(AUTHENTICATION_ENDPOINT + '?client_id=' + CLIENT_ID + '&;redirect_url=' + REDIRECT_URL, '_blank')
    })
  }

  function bindDisconnectButton() {
    var disconnectButton = document.querySelector('.rd-oauth-disconnect');

    disconnectButton.addEventListener('click', function() {
      var data = { action: 'rdsm-disconnect-oauth' };

      jQuery.ajax({
        method: "POST",
        url: ajaxurl,
        data: data,
        success: function() {
          displayConnectButton();
        }
      });
    })
  }

  function listenForMessage() {
    window.addEventListener('message', oauthIntegration);
  }

  function persist(message) {
    jQuery(document).ready(function ($) {
      var tokens = JSON.parse(message.data);
      var data = {
        action: 'rd-persist-tokens',
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken
      };

      jQuery.ajax({
        method: "POST",
        url: ajaxurl,
        data: data,
        success: function() {
          displayDisconnectButton();
          persistLegacyTokens(tokens.accessToken)
        }
      });
    });
  }

  function persistLegacyTokens(accessToken) {
    jQuery.ajax({
      url: LEGACY_TOKENS_ENDPOINT,
      headers: { 'Authorization':'Bearer ' + accessToken },
      method: 'GET',
      success: function(data) {
        data.action = 'rd-persist-legacy-tokens';
        jQuery.post(ajaxurl, data);
      }
    });
  }

  function toggleFeatures() {
    jQuery.ajax({
      url: ajaxurl,
      method: 'POST',
      data: { action: 'rdsm-authorization-check' },
      success: function(data) {
        if (data.token) {
          displayDisconnectButton();
        } else {
          displayConnectButton();
        }
      }
    });
  }

  function displayConnectButton() {
    var connectButton = document.querySelector('.rd-oauth-integration');
    var disconnectButton = document.querySelector('.rd-oauth-disconnect');
    var checkbox = document.querySelector('.checkbox-switch input');
    var warning = document.querySelector('small.warning');
    jQuery(disconnectButton).addClass('hidden');
    jQuery(connectButton).removeClass('hidden');
    jQuery(checkbox).attr('checked', false);
    jQuery(checkbox).attr('disabled', true);
    jQuery(warning).removeClass('hidden');
  }

  function displayDisconnectButton() {
    var connectButton = document.querySelector('.rd-oauth-integration');
    var disconnectButton = document.querySelector('.rd-oauth-disconnect');
    var checkbox = document.querySelector('.checkbox-switch input');
    var warning = document.querySelector('small.warning');
    jQuery(connectButton).addClass('hidden');
    jQuery(disconnectButton).removeClass('hidden');
    jQuery(checkbox).attr('disabled', false);
    jQuery(warning).addClass('hidden');
  }

  function init() {
    toggleFeatures();
    bindConnectButton();
    bindDisconnectButton();
    listenForMessage();
  }

  window.addEventListener('load', init);
})();
