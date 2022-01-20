('use strict');

const e = React.createElement;

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
}

class Comments extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      comments: [],
      message: '',
    };
    this.idNews = parseInt(window.location.href.split('/').reverse()[0]);
    this.socket = io('http://localhost:3000', {
      query: {
        newsId: this.idNews,
      },
    });
  }

  componentDidMount() {
    this.getAllComments();

    this.socket.on('newComment', (message) => {
      const comments = this.state.comments;
      comments.unshift(message);
      this.setState({ comments });
      this.setState({ message: '' });
    });

    this.socket.on('removeComment', (payload) => {
      const { id } = payload;
      const comments = this.state.comments.filter((c) => c.id !== id);
      this.setState({ comments });
    });

    this.socket.on('editComment', (payload) => {
      const { commentId, commentMessage } = payload;
      const comments = this.state.comments.map((c) => {
        if (c.id === commentId) {
          c.message = commentMessage;
        }
        return c;
      });
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

  handleChange({ target: { value } }, id) {
    const comments = this.state.comments.map((c) => {
      if (c.id === id) {
        c.message = value;
      }
      return c;
    });
    this.setState({ comments });
  }

  sendMessage = () => {
    if (this.state.message) {
      this.socket.emit('addComment', {
        idNews: this.idNews,
        message: this.state.message,
      });
    }
  };

  removeComment = (idComment) => {
    fetch(`http://localhost:3000/comments/api/${idComment}`, {
        method: 'DELETE',
      },
    );
  };

  openRedact = (id) => {
    const comments = this.state.comments.map((c) => {
      if (c.id === id) {
        c.activeRedact = true;
      }
      return c;
    });
    this.setState({ comments });
    // this.socket.emit('comment.edit', {
    //   idNews: this.idNews,
    //   idComment: idComment,
    // });
  };

  saveEdit = (id) => {
    const comment = this.state.comments.find((c) => c.id === id);
    this.socket.emit('comment.edit', {
      newsId: this.idNews,
      commentId: id,
      commentMessage: comment.message,
    });
    const comments = this.state.comments.map((c) => {
      if (c.id === id) {
        c.activeRedact = false;
      }
      return c;
    });
    this.setState({ comments });
  };

  render() {
    const userId = parseInt(getCookie('userId'));
    const userRole = getCookie('userRole');
    return (
      <div>
        {this.state.comments.map((comment, index) => {
          return (
            <div key={comment + index} className="card mb-1">
              <div>
                {comment.user && (userRole === 'admin' || comment.user.id === userId) && 
                <button
                  onClick={() => this.removeComment(comment.id)}
                  className="btn btn-outline-info btn-sm px-4 me-sm-3 fw-bold"
                >
                    remove
                </button>
                }
                {comment.user.id === userId &&
                <button
                  onClick={() => this.openRedact(comment.id)}
                  className="btn btn-outline-info btn-sm px-4 me-sm-3 fw-bold"
                >
                    edit
                </button>
                }
              </div>
              <div className="card-body">
                <strong>{comment.user.firstName}</strong>
                {comment.activeRedact ? (
                                      <div>
                                        <h6 className="lh-1 mt-3">редактирование комментария</h6>
                                        <div className="form-floating mb-1">
                                          <textarea
                                          className="form-control"
                                          placeholder="Leave a comment here"
                                          value={comment.message}
                                          onChange={(e) => this.handleChange(e, comment.id)}
                                          ></textarea>
                                        </div>
                                        <button
                                          onClick={() => this.saveEdit(comment.id)}
                                          className="btn btn-outline-info btn-sm px-4 me-sm-3 fw-bold"
                                        >
                                          save
                                        </button>
                                      </div>
                                    ) : (
                                      <div>{comment.message}</div>
                                    )}
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
