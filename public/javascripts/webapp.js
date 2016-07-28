var Dashboard = React.createClass({
    render: function () {
        return (
            <div>
                <h1>Where there is a need, there is a dashboard</h1>
            </div>
        );
    }
});

ReactDOM.render(
    <Dashboard />,
    document.getElementById('content')
);