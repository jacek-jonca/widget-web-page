var system = require("system");
var e2ePort = system.env.E2E_PORT || 8099;
var url = "http://localhost:"+e2ePort+"/src/widget-e2e.html";

casper.on("remote.message", function(msg) {
  this.echo(msg);
});

casper.test.begin("Web Page Widget - Integration Testing", {

  test: function(test) {
    casper.start();

    casper.thenOpen(url, function () {
      test.assertTitle("Web Page Widget", "Test page has loaded");
    });

    casper.then(function () {
      casper.evaluate(function () {
        var evt = document.createEvent("CustomEvent");

        evt.initCustomEvent("WebComponentsReady", false, false);
        window.dispatchEvent(evt);
      });

      casper.waitFor(function waitForUI() {
          return this.evaluate(function configureBackground() {
            return document.getElementById("background").getAttribute("style") !== "";
          });
        },
        function then() {
          test.comment("Testing background");

          test.assertExists(".scale-to-fit", "Scale to fit");
          test.assertExists(".middle-center", "Alignment");
          test.assertEquals(this.getElementAttribute("#background", "style"),
            "background-image: url(http://s3.amazonaws.com/rise-common/images/logo-small.png); ", "Image");
          test.assertEquals(this.getElementAttribute("body", "style"),
            "background-image: initial; background-attachment: initial; background-origin: initial; " +
            "background-clip: initial; background-color: rgba(145, 145, 145, 0); " +
            "background-position: initial initial; background-repeat: initial initial; ",
            "Background color");
        });
    });

    casper.then(function () {
      test.comment("Testing iframe configurations");

      test.assertExists("#webpage-frame", "Should ensure iframe is present");

      test.assertEquals(this.getElementAttribute("#webpage-frame", "src"), "http://www.risevision.com",
        "Should be correct src value for iframe");

      test.assertEquals(this.getElementAttribute("#webpage-frame", "scrolling"),
        "yes", "Should be correct scrolling value for iframe");

      test.assertEval(function () {
        var hasStyle = false,
          el = document.querySelector("#webpage-container"),
          style = document.defaultView.getComputedStyle(el, null).getPropertyValue("padding-bottom");

        if (style !== '' && style !== null) {
          hasStyle = true;
        }

        return hasStyle;
      }, "Should apply padding-bottom to webpage-container div");

      test.assertEquals(this.evaluate(function (i, p) {
        return document.querySelector(i).style[p];
      }, ".blocker", "display"), "none", "Should not display the blocker div");
    });

    casper.withFrame(0, function () {
      test.comment("Testing within iframe");

      test.assertUrlMatch(/risevision\.com/, "Should be correct url of website loaded");
    });

    casper.run(function () {
      test.done();
    });
  }

});