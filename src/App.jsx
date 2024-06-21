import { useState, useEffect } from "react";
import axios from "axios";
const apiUrl = import.meta.env.VITE_BASE_API_URL;
import "/src/app.css";

export default function App() {
  const defaultFormData = {
    title: "",
    content: "",
    image: "",
    categoryId: "",
    tags: [],
    published: false,
    userId: 1,
  };

  const [formData, setFormData] = useState(defaultFormData);
  const [posts, setPosts] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);

  const [tags, setTags] = useState([]);
  const [categories, setCategories] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchCategories = async () => {
    try {
      const { data } = await axios.get(`${apiUrl}/categories`);
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchTags = async () => {
    try {
      const { data } = await axios.get(`${apiUrl}/tags`);
      setTags(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchPosts = async ()=> {
    try {
      const { data } = await axios.get(`${apiUrl}/posts`);
      console.log("Fetched posts:", data);
      setPosts(data.data);
      setCurrentPage(data.page);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchTags();
    fetchPosts();
  }, []);

  const handleField = (name, value) => {
    setFormData((data) => ({ ...data, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingIndex !== null) {
      updatePost(editingIndex, formData);
    } else {
      const res = await axios.post(`${apiUrl}/posts`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    }
    setFormData(defaultFormData);
    setEditingIndex(null);
    fetchPosts(currentPage);
  };


  const removePost = async (id) => {
    try {
      await axios.delete(`${apiUrl}/posts/${id}`);
      setPosts((postsArray) => {
        return postsArray.filter((post) => post.id !== id);

      });
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  // const updatePost = (indexToUpdate, updatedPost) => {
  //   setPosts((postsArray) => {
  //     const newPostsArray = [...postsArray];
  //     newPostsArray[indexToUpdate] = updatedPost;
  //     return newPostsArray;
  //   });
  // };

  const startEditing = (index) => {
    setFormData(posts[index]);
    setEditingIndex(index);
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      fetchPosts(currentPage + parseInt(1));
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      fetchPosts(currentPage - 1);
    }
  };

  return (
    <>
      <section className="form-section">
        <form onSubmit={handleSubmit}>
          <div className="form-element">
            <label htmlFor="title" className="title">
              Titolo Post
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleField("title", e.target.value)}
              required
            />
          </div>
          <div className="form-element content">
            <label htmlFor="content">Contenuto</label>
            <textarea
              name="content"
              id="content"
              cols="30"
              rows="10"
              value={formData.content}
              onChange={(e) => handleField("content", e.target.value)}
              required
            ></textarea>
          </div>
          <div className="form-element image">
            <label htmlFor="image">Immagine</label>
            <input
              type="text"
              name="image"
              id="image"
              value={formData.image}
              onChange={(e) => handleField("image", e.target.value)}
            />
          </div>
          <div className="form-element category">
            <label htmlFor="category">Categoria</label>
            <select
              name="category"
              id="category"
              value={formData.categoryId}
              onChange={(e) => handleField("categoryId", e.target.value)}
            >
              {categories?.length &&
                categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
            </select>
          </div>
          <div className="form-element tags">
            <label htmlFor="tags">Tags</label>
            {tags?.length &&
              tags?.map((tag, index) => (
                <div key={index}>
                  <input
                    type="checkbox"
                    id={`tag-${index}`}
                    name="tags"
                    value={tag.id}
                    checked={formData.tags.includes(tag.id)}
                    onChange={(e) => {
                      const newTags = formData.tags.includes(tag.id)
                        ? formData.tags.filter((t) => t !== tag.id)
                        : [...formData.tags, tag.id];
                      handleField("tags", newTags);
                    }}
                  />
                  <label htmlFor={`tag-${index}`}>{tag.name}</label>
                </div>
              ))}
          </div>
          <button type="submit">
            {editingIndex !== null ? "Update" : "Submit"}
          </button>
        </form>
        <div className="title-container">
          <button onClick={fetchPosts}>Fetch Post</button>
          {posts.length > 0 && (
            <>
              <h2>I Post sono:</h2>
              <section className="list">
                {posts.map((post, index) => (
                  <article key={`post${index}`} className="title-item">
                    <span>Titolo:</span>
                    <h2>{post.title}</h2>
                    <span>Contenuto:</span>
                    <p>{post.content}</p>
                    <span>Tags:</span>
                    {post.tags &&
                      post.tags.map((tag, index) => (
                        <p key={index}>{tag.name}</p>
                      ))}
                    <span>Immagine:</span>
                    <img src={post.image} alt={post.title} />
                    <br />
                    <span>Categoria:</span>
                    <p>{post.category.name}</p>
                    <button
                      onClick={() => startEditing(post.id)}
                      className="edit-button"
                    >
                      Edita
                    </button>
                    <button
                      onClick={() => removePost(post.id)}
                      className="delete-button"
                    >
                      Cancella
                    </button>
                  </article>
                ))}
              </section>
              <div className="pagination">
                <button onClick={() => goToPreviousPage(currentPage => currentPage - 1)} disabled={currentPage === 1}>
                  Precedente
                </button>
                <span>Pagina {currentPage} di {totalPages}</span>
                <button onClick={() => goToNextPage(currentPage => currentPage + 1)} disabled={currentPage === totalPages}>
                  Prossima
                </button>
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
}
