import * as React from 'react';
import { Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import Home from './components/Home';
import FetchData from './components/FetchData';
import FetchDataSources from './components/FetchDataSources';
import Counter from './components/Counter';

export const routes = <Layout>
    <Route exact path='/' component={Home} />
    <Route path='/fetchdatasources/:startDateIndex?' component={FetchDataSources} />
    <Route path='/counter' component={ Counter } />
    <Route path='/fetchdata/:startDateIndex?' component={ FetchData } />
</Layout>;
