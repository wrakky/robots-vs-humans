RvH = {

	initEvents: function() {

		/**
		 * Link click events
		 * Open external links in a new tab
		 */
		$('body').on('click', 'a', function(e) {

			// get url
			var href = $(this).attr('href');

			// link contains :// so is external
			if (/:\/\//.test(href)) {

				e.preventDefault();

				// open it
				RvH.common.Util.openLink(href);

			}

		});

		/**
		 * Bootstrap tab show event
		 * Sometimes scrollbar does not show so this tries to force it to do so
		 */
		$('a[data-toggle="tab"]').on('shown.bs.tab', function(e) {

			// also track tab view
			RvH.common.Analytics.pageview('popup.html' + $(e.target).attr('href'), 'Popup ' + $(e.target).data('title'));

		});

	}

};

$(function() {

	/**
	 * Populate the popup
	 */
	 function populate(data) {
 		// robots.txt
 		RvH.common.Util.parseText(data.robots, 'robots.txt', function(data) {
			$('#robots').html(data);
		})

		// humans.txt
		RvH.common.Util.parseText(data.humans, 'humans.txt', function(data) {
			$('#humans').html(data);
		})

		// fight!
		RvH.Fight.init(data);

	};

	// reload the robots.txt and humans.txt files
	$('#reload')
		// show tooltip on button
		.tooltip({
			title:		chrome.i18n.getMessage('reloadTooltip'),
			placement:	'bottom'
		})
		.click(function(e) {
			// update content
			$('#robots').html('<p>' + chrome.i18n.getMessage('reloading') + '</p>');
			$('#humans').html('<p>' + chrome.i18n.getMessage('reloading') + '</p>');
			$('#fight').html('<p>' + chrome.i18n.getMessage('reloading') + '</p>');
			// reload files
			RvH.common.Fetcher.reload(populate);
		});

	// get the active page files and populate the popup
	RvH.common.Cache.getActive(function(data) {
		RvH.Robots.populate(data.robots);
		RvH.Humans.populate(data.humans);
		RvH.Fight.init(data);
	});

	// localization
	$('[data-i18n]').each(function() {
		var text = chrome.i18n.getMessage($(this).data('i18n'));
		var format = $(this).data('i18n-format');
		if (format === 'lowercase') {
			text = text.toLowerCase();
		}
		var method = $(this).data('i18n-method');
		if (method === 'html') {
			$(this).html(text);
		}
		else {
			$(this).text(text);
		}
	});

	// events

	RvH.common.Settings.getLocal('updateType', function(updateType) {

		// no pending update type
		if (updateType === false) {

			// track page view
			RvH.common.Analytics.pageview('popup.html#robots', 'Popup Robots');

		}
		else {

			if (updateType === 'update') {
				$('#update-notice').text(chrome.i18n.getMessage('updateNotification', chrome.runtime.getManifest().version));
			}
			else {
				$('#update-notice').text(chrome.i18n.getMessage('installNotification'));
			}

			// show update notice
			$('#update-notice').removeClass('hide');

			// show about tab
			$('a[href="#about"]').tab('show');

			// reset update type
			RvH.common.Settings.setLocal('updateType', false);

		}

	});

	// initialise events
	RvH.initEvents();

});

// set error handling
window.onerror = function(message, url, linenumber) {
	RvH.common.Util.logError(message, url, linenumber);
}
