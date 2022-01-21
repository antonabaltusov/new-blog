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
      news: {},
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

  async componentDidMount() {
    await this.getAllComments();
    await this.getNews();

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
          c.activeRedact = false;
        }
        return c;
      });
      this.setState({ comments });
    });

    this.socket.on('editNews', (news) => {
      this.setState({ news });
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

  getNews = async () => {
    const response = await fetch(
      `http://localhost:3000/news/api/${this.idNews}`,
      {
        method: 'GET',
      },
    );

    if (response.ok) {
      const news = await response.json();
      this.setState({ news });
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
    });
  };

  removeNews = async () => {
    const response = await fetch(
      `http://localhost:3000/news/api/${this.idNews}`,
      {
        method: 'DELETE',
      },
    );

    if (response.ok) {
      alert('Новость удалена');
      window.location.href = `/news/all`;
    }
  };

  openRedact = (id) => {
    const comments = this.state.comments.map((c) => {
      if (c.id === id) {
        c.activeRedact = true;
      }
      return c;
    });
    this.setState({ comments });
  };

  saveEdit = (id) => {
    const comment = this.state.comments.find((c) => c.id === id);
    fetch(`http://localhost:3000/comments/api/${comment.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: comment.message }),
    });
  };

  render() {
    const userId = parseInt(getCookie('userId'));
    const userRole = getCookie('userRole');
    return (
      <div>
        <a
          href="http://localhost:3000/news/all"
          className="btn btn-primary m-1"
          role="button"
          data-bs-toggle="button"
        >
          ко всем новостям
        </a>
        {userId ? (
          <a
            href="http://localhost:3000/user/edit"
            className="btn btn-primary m-1"
            role="button"
            data-bs-toggle="button"
          >
            редактировать профиль
          </a>
        ) : (
          <a
            href="http://localhost:3000/users/create"
            className="btn btn-primary m-1"
            role="button"
            data-bs-toggle="button"
          >
            регистрагия
          </a>
        )}
        {this.state.news.user && (
          <div className="card mb-3" style={{ width: '100%' }}>
            {this.state.news.cover && (
              <img
                src={this.state.news.cover}
                style={{ height: '200px', objectFit: 'cover' }}
                className="card-img-top"
                alt="фото новости"
              />
            )}
            <div className="card-body">
              <h5 className="card-title">{this.state.news.title}</h5>
              <h6 className="card-subtitle mb-2 text-muted">
                {this.state.news.author}
              </h6>
              <p className="card-text">{this.state.news.description}</p>
            </div>
            <div className="d-flex flex-row-reverse">
              {userId === this.state.news.user.id && (
                <a
                  href={`http://localhost:3000/news/edit/news/${this.state.news.id}`}
                  className="btn btn-primary m-1"
                  role="button"
                  data-bs-toggle="button"
                >
                  редактировать
                </a>
              )}
              {(userRole === 'admin' || this.state.news.user.id === userId) && (
                <button
                  onClick={this.removeNews}
                  className="btn btn-primary m-1"
                  role="button"
                  data-bs-toggle="button"
                >
                  удалить новость
                </button>
              )}
            </div>
          </div>
        )}
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
        {userId ? (
          <div>
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
        ) : (
          ''
        )}
      </div>
    );
  }
}

const domContainer = document.querySelector('#app');
ReactDOM.render(e(Comments), domContainer);
