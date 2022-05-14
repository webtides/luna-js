export default class RedirectComponent {

	async loadDynamicProperties({ response }) {
		return response.redirect('/');
	}
}
