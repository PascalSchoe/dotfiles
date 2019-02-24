class SettingsController {
    constructor() {
        chrome.storage.sync.get({ showPopup: 0 }, (settings) => {
            document.body.style.visibility = 'visible';
            const showOptions = {
                [0]: 'Always',
                [1]: 'When project is not specified',
                [2]: 'Never'
            };
            let items = [];
            for (let option in showOptions) {
                items.push($('<option />').text(showOptions[option]).val(option.toString()));
            }
            $('#show-popup-settings')
                .append(items)
                .val(settings.showPopup.toString())
                .on('change', () => {
                chrome.storage.sync.set({
                    showPopup: $('#show-popup-settings :selected').val()
                });
            });
        });
    }
}
if (typeof document != undefined) {
    new SettingsController();
}
