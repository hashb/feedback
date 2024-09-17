document.addEventListener('DOMContentLoaded', () => {
    const commentForm = document.getElementById('comment-form');
    const wordCloudContainer = document.getElementById('word-cloud');

    const fetchComments = async () => {
        try {
            const response = await fetch('/api/comments');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const comments = await response.json();
            console.log('Fetched comments:', comments);  // Debug log
            renderWordCloud(comments);
        } catch (error) {
            console.error('Error fetching comments:', error);
        }
    };

    const renderWordCloud = (comments) => {
        console.log('Rendering word cloud with comments:', comments);  // Debug log
        const width = wordCloudContainer.offsetWidth;
        const height = wordCloudContainer.offsetHeight;

        if (comments.length === 0) {
            wordCloudContainer.innerHTML = '<p>No comments yet. Be the first to comment!</p>';
            return;
        }

        const words = comments.map(comment => ({
            text: comment.text,
            size: 10 + (comment.likes || 0) * 2,
            id: comment.id,
            likes: comment.likes || 0
        }));

        d3.layout.cloud()
            .size([width, height])
            .words(words)
            .padding(5)
            .rotate(() => ~~(Math.random() * 2) * 90)
            .font("Arial")
            .fontSize(d => d.size)
            .on("end", draw)
            .start();

        function draw(words) {
            console.log('Drawing words:', words);  // Debug log
            d3.select("#word-cloud").selectAll("*").remove();
            const svg = d3.select("#word-cloud").append("svg")
                .attr("width", width)
                .attr("height", height);

            svg.append("g")
                .attr("transform", `translate(${width/2},${height/2})`)
                .selectAll("text")
                .data(words)
                .enter().append("text")
                .style("font-size", d => `${d.size}px`)
                .style("font-family", "Arial")
                .attr("text-anchor", "middle")
                .attr("transform", d => `translate(${d.x},${d.y})rotate(${d.rotate})`)
                .text(d => d.text)
                .on("mouseover", function(d) {
                    d3.select(this).style("cursor", "pointer");
                    showLikeButton(d, this);
                })
                .on("mouseout", hideLikeButton);
        }
    };

    const showLikeButton = (d, element) => {
        const likeButton = d3.select("#word-cloud").append("g")
            .attr("class", "like-button")
            .attr("transform", `translate(${d.x + d3.select("#word-cloud").node().getBoundingClientRect().left},${d.y + d3.select("#word-cloud").node().getBoundingClientRect().top})`);

        likeButton.append("rect")
            .attr("width", 50)
            .attr("height", 20)
            .attr("fill", "blue");

        likeButton.append("text")
            .attr("x", 25)
            .attr("y", 15)
            .attr("text-anchor", "middle")
            .attr("fill", "white")
            .text(`Like (${d.likes})`);

        likeButton.on("click", () => likeComment(d.id));
    };

    const hideLikeButton = () => {
        d3.select(".like-button").remove();
    };

    const likeComment = async (commentId) => {
        try {
            const response = await fetch(`/api/comments/${commentId}/like`, {
                method: 'POST',
                headers: {
                    'X-CSRFToken': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                }
            });

            if (response.ok) {
                await fetchComments();
            } else {
                console.error('Error liking comment');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    commentForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(commentForm);

        try {
            const response = await fetch('/api/comments', {
                method: 'POST',
                body: formData,
                headers: {
                    'X-CSRFToken': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                }
            });

            if (response.ok) {
                commentForm.reset();
                await fetchComments();
            } else {
                const errorData = await response.json();
                alert('Error: ' + JSON.stringify(errorData.errors));
            }
        } catch (error) {
            console.error('Error:', error);
        }
    });

    fetchComments();
});
