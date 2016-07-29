var ActionBar = React.createClass({
    render: function () {
        return (
            <div className="action-bar">
                ActionBar
            </div>
        );
    }
});


var TripleEntry = React.createClass({
    render: function () {
        return (
            <div className="col-md-4">{this.props.name}</div>
        );
    }
});

var CompletionHints = React.createClass({
    render: function () {
        var hints = [];
        this.props.hints.forEach(function (hint) {
            hints.push(
                <div className="col-sm-12">{hint}</div>
            );
        });
        var style = {'visibility': this.props.visible ? 'visible' : 'hidden'};
        return (
            <div className="row hint-list" id="completionHints" style={style}>
                {hints}
            </div>
        );
    }
});

var TripleRelationEntry = React.createClass({
    getInitialState: function () {
        return {
            query: '',
            hintsVisible: false,
            hints: this.props.hints
        };
    },
    handleFocus: function () {
        this.setState({
            hintsVisible: true
        });
    },
    handleBlur: function () {
        this.setState({
            hintsVisible: false
        });
    },
    filterHints: function (q) {
        var filteredHints = this.props.hints.filter(function (hint) {
            return hint.contains(q);
        });


        this.setState({
            hints: filteredHints
        });

    },
    handleTextChange: function (e) {
        this.setState({
            query: e.target.value
        });
        this.filterHints(e.target.value);
    },
    render: function () {
        return (
            <div className="col-md-4">
                <input type="text"
                       onFocus={this.handleFocus}
                       onBlur={this.handleBlur}
                       placeholder="Start typing"
                       value={this.state.query}
                       onChange={this.handleTextChange}/>
                <CompletionHints hints={this.state.hints} visible={this.state.hintsVisible}/>
            </div>
        );
    }
});


var Triple = React.createClass({
    getInitialState: function () {
        return {
            hints: []
        };
    },
    componentDidMount: function () {
        $.get('/')
    },
    render: function () {
        var data = this.props.data;

        var sub = data.sub;
        var pre = data.pre;
        var obj = data.obj;
        var hints = ["hint 1", "hint 2", "hint 3"];

        return (
            <div className="row">
                <TripleEntry name={sub}/>
                <TripleRelationEntry name={pre} hints={this.state.hints}/>
                <TripleEntry name={obj}/>
            </div>
        );
    }
});


var TripleList = React.createClass({
    render: function () {
        var triples = this.props.triples;
        var self = this;
        var tripleViews = [];

        triples.forEach(function (t) {
            tripleViews.push(
                <Triple data={t}/>
            );
        });

        return (
            <div>{tripleViews}</div>
        );
    }
});

var ActionCenter = React.createClass({
    render: function () {
        var ts = [
            {sub: 'Wheat', pre: 'tastes', obj: 'sweet'},
            {sub: 'Wheat', pre: 'tastes', obj: 'sweet'},
            {sub: 'Wheat', pre: 'tastes', obj: 'sweet'}
        ];
        return (
            <div className="col-md-9">
                <div className="row">
                    <ActionBar/>
                    <TripleList triples={ts}/>
                </div>
            </div>
        );
    }
});


var FilterableFileList = React.createClass({
    handleFileItemClicked: function () {
        alert('Hello');
    },
    render: function () {
        var fileList = this.props.fileList || [];
        var listViews = [];
        var self = this;

        fileList.forEach(function (file) {
            listViews.push(
                <div className="row" onClick={self.handleFileItemClicked}>
                    <div className="file-item">{file.name}</div>
                </div>
            );
        });

        return (
            <div className="col-md-3">
                {listViews}
            </div>
        );
    }
});


var FAB = React.createClass({
    handleClick: function (e) {
        alert('Hello');
    },
    render: function () {
        return (
            <div className="fab" onClick={this.handleClick}>
                <span className="glyphicon glyphicon-plus whitish fab-font"></span>
            </div>
        );
    }
});

var Dashboard = React.createClass({
    render: function () {
        return (
            <div className="container-fluid">
                <div className="row">Here comes the header</div>
                <div className="row">
                    <FilterableFileList
                        fileList={[{name: 'A'}, {name: "CCC"}, {name: "DDD"}]}
                    />
                    <ActionCenter/>
                </div>
                <FAB/>
            </div>
        );
    }
});

ReactDOM.render(
    <Dashboard />,
    document.getElementById('content')
);