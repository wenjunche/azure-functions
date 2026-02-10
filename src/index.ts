import { app } from '@azure/functions';
import './functions/EnterpriseBrowserValidator';

app.setup({
    enableHttpStream: true,
});
