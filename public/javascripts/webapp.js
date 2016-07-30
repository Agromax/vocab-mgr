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

var Hint = React.createClass({
    highlight: function (s, q) {
        var j = 0;
        var highlighted = [];

        for (var i = 0; i < q.length; i++) {
            var qi = q.charAt(i);

            for (; j < s.length; j++) {
                var sj = s.charAt(j);
                if (qi.toLowerCase() === sj.toLowerCase()) {
                    highlighted.push("<b>" + sj + "</b>");
                    j++;
                    break;
                } else {
                    highlighted.push(sj);
                }
            }
        }

        while (j < s.length) {
            highlighted.push(s.charAt(j));
            j++;
        }
        return highlighted.join('');
    },
    rawMarkup: function () {
        var q = this.props.query || "";
        var text = this.highlight(this.props.text, q);
        return {__html: text};
    },

    click: function () {
        this.props.onSelected(this.props.text);
    },

    render: function () {
        var self = this;
        var hintClass = "col-sm-12 hint";
        return (
            <div
                dangerouslySetInnerHTML={this.rawMarkup()}
                className={hintClass}
                onClick={self.click}>
            </div>
        );
    }
});

var CompletionHints = React.createClass({
    getInitialState: function () {
        return {selected: ''};
    },
    handleHintSelected: function (hintText) {
        this.setState({selected: hintText});
        this.props.onHintSelected(hintText);
    },
    componentDidUpdate: function () {
        ReactDOM.findDOMNode(this).scrollTop = 0;
    },
    render: function () {
        var hints = [];
        var self = this;

        this.props.hints.forEach(function (hint) {
            hints.push(
                <Hint
                    onSelected={self.handleHintSelected}
                    text={hint}
                    query={self.props.query}
                />
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
            // hintsVisible: false
        });
    },
    filterHints: function (q) {
        var sortedHints = this.props.hints.sort(function (a, b) {
            var ai = a.toLowerCase().indexOf(q);
            var bi = b.toLowerCase().indexOf(q);
            if (ai >= 0 && bi >= 0) {
                return ai - bi;
            }
            if (ai < 0 && bi >= 0) {
                return 1;
            }
            if (bi < 0 && ai >= 0) {
                return -1;
            }
            return 0;
        });
        this.setState({
            hints: sortedHints
        });

    },

    componentDidMount: function () {
        var self = this;
        $.get("http://localhost:3000/relations", function (data) {
            self.setState({
                hints: data.split("\n")
            });
        });
    },

    handleTextChange: function (e) {
        this.setState({
            query: e.target.value
        });
        this.filterHints(e.target.value);
    },

    handleHintSelected: function (hintText) {
        this.setState({
            hintsVisible: false,
            query: hintText
        })
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
                <CompletionHints hints={this.state.hints}
                                 visible={this.state.hintsVisible}
                                 onHintSelected={this.handleHintSelected}
                                 query={this.state.query}
                />
            </div>
        );
    }
});


var Triple = React.createClass({
    getInitialState: function () {
        return {
            hints: ["hint 1", "hint 2", "hint 3", "hint 4"]
        };
    },
    componentDidMount: function () {
        var self = this;
        $.get("http://localhost:3000/relations", function (data) {
            self.setState({
                hints: data.split("\n")
            });
        });
    },
    render: function () {
        var data = this.props.data;

        var sub = data.sub;
        var pre = data.pre;
        var obj = data.obj;

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


var File

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