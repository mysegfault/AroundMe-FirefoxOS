function Ui() {
	this.templates = $('#templates');
	console.log('#####');
	console.log(this.templates);
}

//this.ui.confirm('Installer ?', 'Voulez-vous installer l\'application ?', 'Installer', function() {alert('OK');});
Ui.prototype.confirm = function(title, description, buttonTitle, buttonAction) {
	console.log('Je veux créer un CONFIRM');
	var template = this.templates.find('.template-confirm');
	
	template.find('h3').text(title);
	template.find('p').text(description);
	template.find('.cancel-button').on('click', function() {
		template.addClass('undisplayed');
	});
	template.find('.confirm-button').on('click', buttonAction);
	template.find('.confirm-button').on('click', buttonAction);
	template.removeClass('undisplayed');
};
//this.ui.header('Coucou');
Ui.prototype.header = function(title) {
	console.log('Je veux créer un HEADER');
	var template = this.templates.find('.template-header');
	
	template.find('h1').text(title);
	template.removeClass('undisplayed');
};
