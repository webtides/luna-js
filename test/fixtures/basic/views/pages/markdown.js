import content, { data } from '../../app/data.md';

export default () => {
	return `
        ${content}
        ${data.config ? 'SUCCESS' : ''}
    `;
};
