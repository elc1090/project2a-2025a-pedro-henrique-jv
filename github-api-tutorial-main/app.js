const gitHubForm = document.getElementById('gitHubForm');
const repoForm = document.getElementById('repoForm');
const backToReposBtn = document.getElementById('backToReposBtn');
let allRepos = [];

gitHubForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const usernameInput = document.getElementById('usernameInput');
    const gitHubUsername = usernameInput.value.trim();

    requestUserRepos(gitHubUsername)
        .then(response => response.json())
        .then(data => {
            const ul = document.getElementById('userRepos');
            ul.innerHTML = '';
            allRepos = [];

            if (data.message === "Not Found") {
                const li = document.createElement('li');
                li.classList.add('list-group-item');
                li.innerHTML = `<p><strong>No account exists with username:</strong> ${gitHubUsername}</p>`;
                ul.appendChild(li);
                return;
            }

            allRepos = data;
            document.getElementById('repoForm').style.display = 'flex';
            document.getElementById('backToReposBtn').style.display = 'none';
            showRepos();
        });
});

repoForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const filterValue = document.getElementById('repoNameInput').value.trim().toLowerCase();
    const ul = document.getElementById('userRepos');
    ul.innerHTML = '';

    const filteredRepos = allRepos.filter(repo => repo.name.toLowerCase().includes(filterValue));

    if (filteredRepos.length === 0) {
        const li = document.createElement('li');
        li.classList.add('list-group-item');
        li.innerHTML = `<p><strong>Nenhum repositório encontrado com esse nome.</strong></p>`;
        ul.appendChild(li);
        return;
    }

    filteredRepos.forEach(repo => {
        const li = document.createElement('li');
        li.classList.add('list-group-item');
        li.innerHTML = `
            <p><strong>Repo:</strong> ${repo.name}</p>
            <p><strong>Description:</strong> ${repo.description || 'Sem descrição'}</p>
            <p><strong>URL:</strong> <a href="${repo.html_url}">${repo.html_url}</a></p>
            <p><span class="commits-link" data-repo="${repo.name}" style="text-decoration: underline; color: blue; cursor: pointer;">Commits</span></p>
        `;
        ul.appendChild(li);
    });

    document.querySelectorAll('.commits-link').forEach(link => {
        link.addEventListener('click', (e) => {
            const repoName = e.target.getAttribute('data-repo');
            const username = document.getElementById('usernameInput').value.trim();
            fetchCommits(username, repoName);
        });
    });
});

backToReposBtn.addEventListener('click', () => {
    showRepos();
});

function requestUserRepos(username) {
    return fetch(`https://api.github.com/users/${username}/repos`);
}

function fetchCommits(username, repoName) {
    const url = `https://api.github.com/repos/${username}/${repoName}/commits`;

    fetch(url)
        .then(response => response.json())
        .then(commits => {
            const ul = document.getElementById('userRepos');
            ul.innerHTML = '';
            document.getElementById('backToReposBtn').style.display = 'inline-block';

            if (commits.message === "Not Found") {
                const li = document.createElement('li');
                li.classList.add('list-group-item');
                li.innerHTML = `<p><strong>Commits não encontrados para o repositório:</strong> ${repoName}</p>`;
                ul.appendChild(li);
                return;
            }

            const titleLi = document.createElement('li');
            titleLi.classList.add('list-group-item', 'active');
            titleLi.innerHTML = `<strong>Commits do repositório:</strong> ${repoName}`;
            ul.appendChild(titleLi);

            commits.forEach(commit => {
                const li = document.createElement('li');
                li.classList.add('list-group-item');
                li.innerHTML = `
                    <p><strong>Mensagem:</strong> ${commit.commit.message}</p>
                    <p><strong>Data:</strong> ${new Date(commit.commit.author.date).toLocaleString()}</p>
                `;
                ul.appendChild(li);
            });
        });
}

function showRepos() {
    const ul = document.getElementById('userRepos');
    ul.innerHTML = '';

    allRepos.forEach(repo => {
        const li = document.createElement('li');
        li.classList.add('list-group-item');
        li.innerHTML = `
            <p><strong>Repo:</strong> ${repo.name}</p>
            <p><strong>Description:</strong> ${repo.description}</p>
            <p><strong>URL:</strong> <a href="${repo.html_url}">${repo.html_url}</a></p>
            <p><span class="commits-link" data-repo="${repo.name}" style="text-decoration: underline; color: blue; cursor: pointer;">Commits</span></p>
        `;
        ul.appendChild(li);
    });

    document.querySelectorAll('.commits-link').forEach(link => {
        link.addEventListener('click', (e) => {
            const repoName = e.target.getAttribute('data-repo');
            const username = document.getElementById('usernameInput').value.trim();
            fetchCommits(username, repoName);
        });
    });

    document.getElementById('backToReposBtn').style.display = 'none';
}