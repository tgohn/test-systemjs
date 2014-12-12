import react from 'react';
import Hello from 'lib/Hello.jsx!';
//import props from '~/props';

System.import('~/props')
	.then(function(module) {
		var props = module.default;
		react.render(
			react.createElement(Hello, props),
			document.body
		);
	});
