// Quiz — standalone module, loaded only on quiz.html

(function () {
  var quizData = [
    // Unit 1: Introduction to Deep Learning
    { q: "What is the defining characteristic that makes deep learning 'deep'?", opts: ["It uses only one hidden layer", "It requires manually engineered features", "It stacks many layers that learn increasingly abstract representations", "It only works on tabular data"], correct: 2, explain: "Depth refers to the number of stacked layers, each learning progressively more abstract features from raw data." },
    { q: "Which paper introduced the Transformer architecture and sparked the modern LLM era?", opts: ["'ImageNet Classification with Deep CNNs' (2012)", "'Attention Is All You Need' (2017)", "'Learning representations by backpropagating errors' (1986)", "'A logical calculus of ideas' (1943)"], correct: 1, explain: "'Attention Is All You Need' (2017) introduced the Transformer, replacing recurrence with self-attention." },
    // Unit 2: Neural Networks and Backpropagation
    { q: "What does backpropagation actually compute?", opts: ["The network's final predictions", "The gradient of the loss with respect to every weight", "The learning rate", "The number of layers needed"], correct: 1, explain: "Backpropagation uses the chain rule to efficiently compute how much each weight contributed to the loss." },
    { q: "Why is the ReLU activation function so widely used in hidden layers?", opts: ["It outputs probabilities between 0 and 1", "It is cheap to compute and avoids saturation for positive inputs, speeding up convergence", "It always prevents overfitting", "It replaces the need for backpropagation"], correct: 1, explain: "ReLU (max(0,z)) is computationally cheap and doesn't saturate for z>0, which helps gradients flow during training." },
    // Unit 3: CNNs
    { q: "What two ideas let CNNs process images far more efficiently than a plain dense network?", opts: ["Weight sharing and local connectivity", "More layers and bigger batches", "Dropout and batch normalization", "Softmax and cross-entropy"], correct: 0, explain: "A filter's weights are shared across the whole image (weight sharing), and each neuron only looks at a small patch (local connectivity)." },
    { q: "In transfer learning with a pre-trained CNN, which layers are typically fine-tuned (if any)?", opts: ["Only the very first convolutional layer", "The later layers, since earlier layers learn general transferable features", "All layers must always be retrained from scratch", "None — transfer learning never adjusts weights"], correct: 1, explain: "Early layers learn general features (edges, colors) that transfer well; later layers are more task-specific and benefit from fine-tuning." },
    // Unit 4: RNNs
    { q: "What problem do LSTM and GRU architectures primarily solve compared to vanilla RNNs?", opts: ["Too much memory usage", "The vanishing gradient problem over long sequences", "Inability to process any sequential data", "Overfitting on small datasets"], correct: 1, explain: "Gating mechanisms in LSTM/GRU let gradients flow through many time steps without vanishing, preserving long-range dependencies." },
    { q: "What does 'unrolling' an RNN through time actually represent?", opts: ["Converting it into a CNN", "The same cell and weights applied repeatedly across time steps, visualized as a chain", "Removing the hidden state", "Running the network backwards only"], correct: 1, explain: "Unrolling draws the single recurrent cell once per time step, showing how the same weights and hidden state flow forward." },
    // Unit 5: Advanced Topics
    { q: "What key advantage does self-attention give Transformers over RNNs?", opts: ["Lower memory usage in all cases", "Sequence positions can be processed in parallel during training", "No need for any training data", "They cannot handle long sequences at all"], correct: 1, explain: "Unlike RNNs' step-by-step processing, self-attention lets all positions be computed in parallel, enabling major speedups on GPUs/TPUs." },
    { q: "In reinforcement learning, what is the agent trying to learn?", opts: ["A fixed labeled mapping from inputs to outputs", "A policy that maximizes cumulative reward through interaction with an environment", "A convolutional filter bank", "A static set of word embeddings"], correct: 1, explain: "RL has no fixed labeled dataset; the agent learns a reward-maximizing policy from the consequences of its own actions." }
  ];

  var quizScore = 0;
  var quizContainer = document.getElementById('quizContainer');

  function buildQuiz() {
    if (!quizContainer) return;
    quizContainer.innerHTML = '';
    quizData.forEach(function (item, qi) {
      var block = document.createElement('div');
      block.className = 'quiz-q';
      block.innerHTML = '<strong>Q' + (qi + 1) + '. ' + item.q + '</strong><div class="quiz-opts"></div><div class="quiz-result" id="qres' + qi + '"></div>';
      var optsWrap = block.querySelector('.quiz-opts');
      item.opts.forEach(function (opt, oi) {
        var d = document.createElement('div');
        d.className = 'quiz-opt';
        d.textContent = opt;
        d.addEventListener('click', function () { answerQuiz(qi, oi, optsWrap); });
        optsWrap.appendChild(d);
      });
      quizContainer.appendChild(block);
    });
    var qt = document.getElementById('quizTotal');
    if (qt) qt.textContent = quizData.length;
  }

  function answerQuiz(qi, oi, wrap) {
    if (wrap.dataset.locked) return;
    wrap.dataset.locked = '1';
    var item = quizData[qi];
    Array.prototype.forEach.call(wrap.children, function (c, i) {
      if (i === item.correct) c.classList.add('correct');
      else if (i === oi) c.classList.add('wrong');
    });
    var res = document.getElementById('qres' + qi);
    if (oi === item.correct) {
      quizScore++;
      res.textContent = '✅ Correct! ' + item.explain;
      res.style.color = '#3fd97e';
    } else {
      res.textContent = '❌ Correct answer: ' + item.opts[item.correct] + ' — ' + item.explain;
      res.style.color = '#f85149';
    }
    var qs = document.getElementById('quizScore');
    if (qs) qs.textContent = quizScore;
  }

  var resetBtn = document.getElementById('resetQuizBtn');
  if (resetBtn) {
    resetBtn.addEventListener('click', function () {
      quizScore = 0;
      var qs = document.getElementById('quizScore');
      if (qs) qs.textContent = 0;
      buildQuiz();
    });
  }

  buildQuiz();
})();
