﻿import * as React from 'react';
import { Link, RouteComponentProps } from 'react-router-dom';
import { connect } from 'react-redux';
import { ApplicationState } from '../store';
import * as DataSourcesState from '../store/DataSources';

// At runtime, Redux will merge together...
type DataSourceProps =
    DataSourcesState.DataSourcesState        // ... state we've requested from the Redux store
    & typeof DataSourcesState.actionCreators      // ... plus action creators we've requested
    & RouteComponentProps<{ startDateIndex: string, forDataSource: string}>; // ... plus incoming routing parameters

class FetchDataSources extends React.Component<DataSourceProps, {}> {
    componentWillMount() {
        // This method runs when the component is first added to the page
        let startDateIndex = parseInt(this.props.match.params.startDateIndex) || 0;
        let dataRequest = { dataSourceName: (this.props.match.params.forDataSource || '') };
        this.props.requestDataSources(startDateIndex, dataRequest);
    }

    componentWillReceiveProps(nextProps: DataSourceProps) {
        // This method runs when incoming props (e.g., route params) change
        let startDateIndex = parseInt(nextProps.match.params.startDateIndex) || 0;
        let dataRequest = { dataSourceName: (this.props.match.params.forDataSource || '') };
        this.props.requestDataSources(startDateIndex, dataRequest);
    }

    public render() {
        return <div>
            <h1>Data Sources</h1>
            <p>This component demonstrates fetching data from the server and working with URL parameters.</p>
            {this.renderDataSourcesTable()}
            {this.renderPagination()}
            {this.renderSubmitButton()}
        </div>;
    }


    private renderDateRangeFields() {
        <table className='table'>
            <thead>
                <tr>
                    <th>Start Date</th>
                    <th>End Date</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>TBD</td>
                    <td>TBD</td>
                </tr>
            </tbody>
        </table>;
    }

    private renderDataSourcesTable() {
        let submitIndex = -2;
        return <table className='table'>
            <thead>
                <tr>
                    <th>Data Source Name</th>
                    <th>Fields Available</th>
                    {false ? <th>Selected</th> : []}
                </tr>
            </thead>
            <tbody>
                {this.props.datasources.map(datasource =>
                    <tr key={datasource.commonName}>
                        <td><Link className='btn btn-default pull-left' to={`/fetchdatasources/${submitIndex}/${datasource.commonName}`}>{datasource.commonName}</Link></td>
                        <td>{datasource.fieldX}</td>
                        {false ? <td>TBD</td> : []}
                    </tr>
                )}
            </tbody>
        </table>;
    }

    private renderPagination() {
        let prevStartDateIndex = (this.props.startDateIndex || 0) - 5;
        let nextStartDateIndex = (this.props.startDateIndex || 0) + 5;
        let refreshIndex = -1;

        return <p className='clearfix text-center'>
            <Link className='btn btn-default pull-left' to={`/fetchdatasources/${refreshIndex}`}>Refresh</Link>
            {//this.props.isLoading ? <span>Loading...</span> : []
            }
        </p>;
        /*return <p className='clearfix text-center'>
            <Link className='btn btn-default pull-left' to={`/fetchdatasources/${prevStartDateIndex}`}>Previous</Link>
            <Link className='btn btn-default pull-right' to={`/fetchdatasources/${nextStartDateIndex}`}>Next</Link>
            {this.props.isLoading ? <span>Loading...</span> : []}
        </p>;*/
    }

    private renderSubmitButton() {
        {
            //"Stretch Goal"
        }
    }
}

export default connect(
    (state: ApplicationState) => state.dataSources, // Selects which state properties are merged into the component's props
    DataSourcesState.actionCreators                 // Selects which action creators are merged into the component's props
)(FetchDataSources) as typeof FetchDataSources;
