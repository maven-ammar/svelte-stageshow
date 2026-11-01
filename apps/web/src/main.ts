import { mount } from 'svelte'
import App from './App.svelte'
import 'svelte-stageshow/style.css'
import './app.css'

const target = document.getElementById('app')
if (!target) throw new Error('#app not found')

const app = mount(App, { target })

export default app
