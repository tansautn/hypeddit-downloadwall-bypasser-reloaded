// ==UserScript==
// @name         Hypeddit, PumpYourSound DownloadWallBypasser 2025
// @namespace    http://tampermonkey.net/
// @version      1.2
// @description  Bypass the fangates. Soundcloud and Spotify accounts are mandatory! Please make sure to log them on first before running the script!
// @author       fan1200, Zuko <tansautn@gmail.com>
// @match        https://hypeddit.com/*
// @match        https://pumpyoursound.com/*
// @match        https://secure.soundcloud.com/connect*
// @match        https://secure.soundcloud.com/authorize*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=hypeddit.com
// @grant        unsafeWindow
// @grant        window.close
// ==/UserScript==

(function() {
  "use strict";
  let targetNode;
  window.hypedditSettings = {
    email                    : "jouch@hippo.com",
    name                     : "Jojo",
    comment                  : "Nice!",
    auto_close               : true,
    auto_close_timeout_in_ms : 5000,
  };
  if(localStorage.getItem('hypedditSettings')) {
    window.hypedditSettings = JSON.parse(localStorage.getItem('hypedditSettings'));
  }
  const pumpUrSoundHandler = function() {
    const steps = document.querySelectorAll('.fanpageDownload__item');
    let isDomLoaded = true;
    let countStepDone = 0;
    const SC = unsafeWindow.SC;
    const $ = unsafeWindow.$;
    if(!window.hasOwnProperty('isPumpHandled')) {
      window.isPumpHandled = false;
    }

    // Alternate method for anyone got "window.onpener" is Null - Like me :(
    // It's mostly caused by some blocking extension or related
    function simulateConnectUsingSdk() {
      try {
        if(localStorage.getItem('scConnDialog')) {
          return;
        }
        localStorage.removeItem('isPumpConnectDone');
        const j = SC.connect(callbackForSc);
        localStorage.setItem('scConnDialog', j.id);
        return j;
      }
      catch(e) {
        setTimeout(simulateConnectUsingSdk, 300);
        return null;
      }
    }

    function callbackForSc() {
      console.info('on callback for connect', this, arguments);
      let doneCond = localStorage.getItem('isPumpConnectDone');
      console.info('check connect done in callback', doneCond);

      if(!doneCond) {
        setTimeout(callbackForSc, 300);
        return;
      }

      if(doneCond) {
        // Only current step have attribute data-href. So this simple selector is enough
        const t = document.querySelector('[data-href]');
        let accessToken;

        const baseUrl = window.location.origin;

        fetch(`${baseUrl}/?do=mySoundcloudAccessToken`, {
          method  : 'GET',
          headers : {
            'X-Requested-With' : 'XMLHttpRequest'
          }
        })
        .then(response => response.text())
        .then(data => {
          console.info('response data', data);
          try {
            data = JSON.parse(data);
          }
          catch(e) {
            console.error('Error in parsing response data:', e);
          }
          accessToken = data.accessToken || '';

          const urlGet = t.dataset.href;
          // Đảm bảo urlGet là URL đầy đủ
          const fullUrlGet = urlGet.startsWith('http') ? urlGet : `${baseUrl}${urlGet.startsWith('/') ? '' : '/'}${urlGet}`;
          const urlParts = fullUrlGet.split('?');
          const urlBase = urlParts[0];
          const params = new URLSearchParams(urlParts.length > 1 ? urlParts[1] : '');

          params.set('accessToken', accessToken);
          params.set('text', window.hypedditSettings.comment);

          return fetch(`${urlBase}?${params.toString()}`, {
            method  : 'GET',
            headers : {
              'X-Requested-With' : 'XMLHttpRequest'
            }
          });
        })
        //        .then(response => response.json())
        .then(data => {
          console.info('done');
          data.text().then(text => {console.error(text);});
          // What should here ?
          // window.location.reload();
        })
        .catch(error => {
          console.error('Error in fetch operation:', error);
        })
        .finally(() => {
          localStorage.removeItem('isPumpConnectDone');
        });
      }
    }

    function alternateMethodForPump() {
      // will be called from connect to like & connect to comment
      console.warn('Run alternateMethodForPump');
      clearLocalStoredVals();
      simulateConnectUsingSdk();
      let itvId = window.setInterval(() => {
        let doneCond = localStorage.getItem('isPumpConnectDone');
        if(doneCond) {
          console.info('call connect callback');
          // SC.connectCallback(localStorage.getItem('scConnDialog'));
          callbackForSc();
          clearInterval(itvId);
          console.info('interval stopped', doneCond);
          return;
        }
      }, 500);
    }

    function clearLocalStoredVals() {
      localStorage.removeItem('scConnDialog');
      localStorage.removeItem('isPumpConnectDone');
    }

    steps.forEach((e) => {
      if(window.isPumpHandled) {
        console.warn('Pump handled, abort');
        return;
      }
      const curEl = e;
      const curStep = curEl.querySelector('.fangateStep.state');
      let stepLabel;
      if(curStep.classList.contains('pull-left') || curStep.classList.contains('done')) {
        countStepDone++;
        return; // continue
      }
      if(!curStep.classList.contains('done')) {
        if(localStorage.getItem('useAlternate')) {
          console.warn('Alternate method for pump will used');
        }

        stepLabel = Array.from(curStep.classList)
                         .find(v => v.includes('fangateStep--'))
                         .replace('fangateStep--', '');
        console.info(stepLabel, curStep, curStep.classList.contains('done'), curStep.classList.contains('pull-left'));
        switch(stepLabel) {
          case 'soundcloud':
          case 'facebook':
            // TODO : use post message API to communicate with child windows.
            // TODO : sessionStorage set value to check the connect process ?? - still does not work between windows
            // TODO : youtube does not require any validation. So just close it's modal
            // TODO : facebook need what to mark as done?, are okay when we simulate the form submit?
            setTimeout((function pumpSimpleStepHandler() {
              return () => {
                console.warn(!document.querySelector('#soundcloud-api') || !isDomLoaded, !document.querySelector('#soundcloud-api'), !isDomLoaded);
                if(!document.querySelector('#soundcloud-api') || !isDomLoaded || !SC) {
                  setTimeout(pumpSimpleStepHandler(), 300);
                  console.info('no SC api or dom not ready yet, try in next 300 ms');
                  return;
                }
                if(!localStorage.getItem('useAlternate')) {
                  console.info('button is : ', curEl.querySelector('.socBtn'));
                  curEl.querySelector('.socBtn').click();
                  console.info('trigger click for ' + stepLabel);
                }
                else {
                  alternateMethodForPump();
                }
              };
            })(), 300);
            break;
          case 'comment':
            const commentPump = () => {
              console.warn(!document.querySelector('#soundcloud-api') || !isDomLoaded, !document.querySelector('#soundcloud-api'), !isDomLoaded);
              if(!document.querySelector('#soundcloud-api') || !isDomLoaded || !SC) {
                setTimeout(commentPump, 300);
                console.info('no SC api or dom not ready yet, try in next 200 ms');
                return;
              }
              // localStorage.setItem('pumpFanGateId', (new URLSearchParams(button.dataset.href.split('?')[1]).get('fangateId')));
              curEl.querySelector('input[name="fangate_comment"]').value = window.hypedditSettings.comment;
              const button = curEl.querySelector('.btn.fangatex__sendComment');
              if(!localStorage.getItem('useAlternate')) {
                console.info('trigger Comment click for ' + stepLabel);
                button.click();
              }
              else {
                alternateMethodForPump();
              }
            };
            setTimeout(commentPump, 300);
            break;
        }
        window.isPumpHandled = true;
      }
    });
    if(countStepDone === steps.length) {
      console.info('all steps done. Submit download form');
      setTimeout(() => document.querySelector('#frm-freeDownloadForm').submit(), 1500);
      return;
    }
  };
  if(location.host.includes('pumpyoursound.com')) {
    console.log('go in');
    const uri = new URL(location.href);
    if(uri.pathname.includes('/f/')) {
      let tryCount = 0;
      const maxTries = 30;
      const waitForSc = function() {
        tryCount++;
        if(tryCount > maxTries) {
          return;
        }
        if(!unsafeWindow.SC) {
          console.info('SC not ready yet, try in next 200 ms');
          setTimeout(waitForSc, 200);
        }
        else {
          pumpUrSoundHandler();
        }
      };
      setTimeout(waitForSc, 200);
    }
    if(uri.searchParams.has('do') && uri.searchParams.get('do') === 'soundConnectAuth') {
      // window.close() already loaded into window.load function already. So it's for "someone like me"
      const pumpConnectHandler = function() {
        if(uri.searchParams.has('state') && uri.searchParams.has('code')) {
          console.info('pump connect close in 1.5 sec');
          localStorage.setItem('isPumpConnectDone', '1');
          setTimeout(window.close, 15000);
        }
      };
      console.info('Run pumpConnectHandler');
      pumpConnectHandler();
    }
    // Why return does not prevent execute of "new MutationObserver" ?. I do not understand
    return;
  }

  if(location.host.includes("soundcloud.com")) {
    let isDone = false;
    const maxTries = 50;
    let cou = 0;

    const retryClick = () => {
      const button = document.querySelector('button[type="submit"]');
      if(button) {
        button.click();
        isDone = true;
      }
      else {
        cou++;
        if(cou < maxTries) {
          setTimeout(retryClick, 200);
        }
      }
    };

    setTimeout(retryClick, 200);
  }

  window.handleFollowOptions = function(containerElementId, skipperId) {
    if(document.getElementById(containerElementId) !== null) {
      document
      .getElementById(containerElementId)
      .querySelectorAll("a")
      .forEach((accountItem) => {
        accountItem.classList.remove("undone");
        accountItem.classList.add("done");
      });

      document.getElementById(skipperId).click();


      window.handleSoundCloud = function() {
        console.log("SOUNDCLOUD");

        const comment = window.hypedditSettings.comment;

        if(document.getElementById("sc_comment_text") !== null) {
          document
          .getElementById("sc_comment_text")
          .setAttribute("value", comment);
        }

        if(document.getElementById("step_sc") !== null) {
          document.getElementById("step_sc").querySelector("a").click();
        }
      };

      window.handleInstagram = function() {
        console.log("INSTA");
        window.handleFollowOptions("instagram_status", "skipper_ig_next");
      };

      window.handleYoutube = function() {
        console.log("YOUTUBE");
        window.handleFollowOptions("youtube_status", "skipper_yt_next");
      };
      if(document.getElementById("step_sc") !== null) {
        document.getElementById("step_sc").querySelector("a").click();
      }
    }
    ;

    window.handleInstagram = function() {
      console.log("INSTA");
      window.handleFollowOptions("instagram_status", "skipper_ig_next");
    };

    window.handleYoutube = function() {
      console.log("YOUTUBE");
      window.handleFollowOptions("youtube_status", "skipper_yt_next");
    };

    window.handleSpotify = function() {
      console.log("SPOTIFY");
      document.getElementById("step_sp").querySelector("a").click();
    };

    window.handleDownload = function() {
      console.log("DOWNLOAD");
      document.getElementById("gateDownloadButton").click();

      if(window.hypedditSettings.auto_close) {
        const timeout = window.hypedditSettings.auto_close_timeout_in_ms;
        setTimeout(function() {
          close();
        }, timeout);
      }
    };

    window.handleDownload = function() {
      console.log("DOWNLOAD");
      downloadUnlimitedGate();

      if(window.hypedditSettings.auto_close) {
        const timeout = window.hypedditSettings.auto_close_timeout_in_ms;
        setTimeout(function() {
          close();
        }, timeout);
      }
    };


    window.handleDownload = function() {
      const email = window.hypedditSettings.email;
      const name = window.hypedditSettings.name;
      console.log("DOWNLOAD");
      document.getElementById("gateDownloadButton").click();

      if(document.getElementById("email_name") !== null) {
        document.getElementById("email_name").setAttribute("value", name);
      }

      if(document.getElementById("email_address") !== null) {
        document
        .getElementById("email_address")
        .setAttribute("value", email);
        document.getElementById("email_address").value = email;
      }
      if(document.getElementById('download_email_step_hide_heading')) {
        document.getElementById('gateDownloadButton').click();
        return;
      }
      document.getElementById("email_to_downloads_next").click();
    };

    window.handleTikTok = function() {
      console.log("TIKTOK");
      window.handleFollowOptions("tiktok_status", "skipper_tk_next");
    };

    window.handleFacebook = function() {
      console.log("FACEBOOK");
      document.getElementById("fbCarouselSocialSection").click();
    };

    window.handleMultiPortal = function() {
      document.getElementById("step_email").previousElementSibling.click();
      window.handleEmail();
    };

    window.handleEmailSoundCloud = function() {
      document.getElementById("step_email").previousElementSibling.click();
      window.handleEmail();
    };

    window.handleSoundCloudYoutube = function() {
      document.getElementById("step_yt").previousElementSibling.click();
      window.handleYoutube();
    };
    window.handleMixcloud = function() {
      console.log("Mixcloud");
      document.getElementById("skipper_mc").click();
    };


    window.handleDonate = function() {
      document.getElementById("step_dn").previousElementSibling.click();
      document.getElementById("donation_next").click();
    };


    targetNode = document.getElementById("myCarousel");
    const config = {attributes : true, childList : true, subtree : true};
    window.handleBandCamp = function() {
      document.getElementById("skipper_bc").click();
    };


    let prevStepContent = null;
    const callback = (mutationList, observer) => {
      for(const mutation of mutationList) {
        if(mutation.type === "attributes") {
          const stepContent = document.querySelector(
          ".fangate-slider-content:not(.move-left)"
          );


          if(stepContent !== prevStepContent) {
            const stepClassList = stepContent.classList;

            if(stepClassList.contains("sp|ig|email")) {
              window.handleMultiPortal();
            }

            if(stepClassList.contains("tk|ig")) {
              window.handleTikTok();
            }


            if(stepClassList.contains("tk|ig")) {
              window.handleTikTok();
            }

            if(stepClassList.contains("sp|ig|email")) {
              window.handleMultiPortal();
            }

            if(stepClassList.contains("dn")) {
              window.handleDonate();
            }

            if(stepClassList.contains("sc")) {
              window.handleSoundCloud();
            }

            if(stepClassList.contains("ig")) {
              window.handleInstagram();
            }

            if(stepClassList.contains("dw")) {
              window.handleDownload();
            }

            if(stepClassList.contains("yt")) {
              window.handleYoutube();
            }

            if(stepClassList.contains("sp")) {
              window.handleSpotify();
            }

            if(stepClassList.contains("fb")) {
              window.handleFacebook();
            }

            if(stepClassList.contains("mc")) {
              window.handleMixcloud();
            }
          }

          if(stepClassList.contains("email")) {
            window.handleEmail();
          }


          if(stepClassList.contains("bc")) {
            window.handleBandCamp();
          }
        }


        if(stepClassList.contains("fb")) {
          window.handleFacebook();
        }
      }


      if(stepClassList.contains("bc")) {
        window.handleBandCamp();
      }
    };


    prevStepContent = stepContent;
  };

// Fix: TypeError: MutationObserver.observe: Argument 1 is not an object.
  if(targetNode) {
    const observer = new MutationObserver(callback);

    observer.observe(targetNode, config);
  }

  const _start = () => {
    if(document.getElementById("downloadProcess") !== null) {
      document.getElementById("downloadProcess").click();
    }
  };

  setTimeout(_start, 800);
})
();

