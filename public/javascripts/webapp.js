var ActionCenter = React.createClass({
    render: function () {
        return (
            <h1>Action Center</h1>
        );
    }
});


var FilterableFileList = React.createClass({
    render: function () {
        return (
            <div></div>
        );
    }
});


var Dashboard = React.createClass({
    render: function () {
        return (
            <div className="container-fluid">
                <div className="row">Here comes the header</div>
                <FilterableFileList />
                <ActionCenter/>
            </div>
        );
    }
});

ReactDOM.render(
    <Dashboard />,
    document.getElementById('content')
);