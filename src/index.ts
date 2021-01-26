import express from 'express';

const app = express();

app.get('/', (_, res) => {
	res.json({hello: 'world' });
})

app.listen(8888, () => console.log('listening on port 8888'));
