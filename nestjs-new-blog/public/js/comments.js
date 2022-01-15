('use strict');

const e = React.createElement;

class Comments extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      comments: [],
      message: '',
    };
    this.idNews = parseInt(window.location.href.split('/').reverse()[0]);
    const bearerToken = Cookies.get('authorization');
    this.socket = io('http://localhost:3000', {
      query: {
        newsId: this.idNews,
      },
      transportOptions: {
        polling: {
          extraHeaders: {
            Authorization: 'Bearer ' + bearerToken,
          },
        },
      },
    });
  }

  componentDidMount() {
    this.getAllComments();

    this.socket.on('newComment', (message) => {
      const comments = this.state.comments;
      comments.push(message);
      this.setState(comments);
    });
    this.socket.on('removeComment', (payload) => {
      const { id } = payload;
      console.log(id);
      const comments = this.state.comments.filter((c) => c.id !== id);
      this.setState({ comments });
    });
  }

  getAllComments = async () => {
    const response = await fetch(
      `http://localhost:3000/comments/api/${this.idNews}`,
      {
        method: 'GET',
      },
    );

    if (response.ok) {
      const comments = await response.json();
      this.setState({ comments });
    }
  };

  onChange = ({ target: { name, value } }) => {
    this.setState({ [name]: value });
  };

  sendMessage = () => {
    this.socket.emit('addComment', {
      idNews: this.idNews,
      message: this.state.message,
    });
  };

  render() {
    return (
      <div>
        {this.state.comments.map((comment, index) => {
          return (
            <div key={comment + index} className="card mb-1">
              <div className="card-body">
                <strong>{comment.user.firstName}</strong>
                <div>{comment.message}</div>
              </div>
            </div>
          );
        })}
        <hr />
        <div>
          <h6 className="lh-1 mt-3">Форма добавления комментариев</h6>
          <div className="form-floating mb-1">
            <textarea
              className="form-control"
              placeholder="Leave a comment here"
              value={this.state.message}
              name="message"
              onChange={this.onChange}
            ></textarea>
            <label htmlFor="floatingmessagearea2">Комментарий</label>
          </div>
          <button
            onClick={this.sendMessage}
            className="btn btn-outline-info btn-sm px-4 me-sm-3 fw-bold"
          >
            Send
          </button>
        </div>
      </div>
    );
  }
}

const domContainer = document.querySelector('#app');
ReactDOM.render(e(Comments), domContainer);
