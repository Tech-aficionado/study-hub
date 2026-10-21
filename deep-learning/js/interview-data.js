// Deep Learning interview questions — data for the shared renderer (../js/interview.js).
// Every answer is written here from scratch, grounded in standard deep learning
// references. Source field cites generic, well-known reference material
// (Goodfellow/Bengio/Courville's "Deep Learning", PyTorch docs, etc.) rather than
// specific fetched URLs.
window.STUDYHUB_INTERVIEW = {
  topic: 'deep-learning',
  questions: [
    // ===================== EASY =====================
    {
      id: 'dl-q1', level: 'easy', category: 'Fundamentals', type: 'concept',
      q: 'What is a neuron in an artificial neural network, and what does it compute?',
      answer: '<p>An artificial neuron takes a set of inputs, multiplies each by a learnable <strong>weight</strong>, sums the results together with a learnable <strong>bias</strong>, and passes that sum through a non-linear <strong>activation function</strong> to produce its output.</p><p>Formally: <code>a = f(w1·x1 + w2·x2 + ... + wn·xn + b)</code>. A full network is simply many of these units arranged in layers, connected so one layer\'s outputs become the next layer\'s inputs.</p>',
      source: { site: 'Deep Learning (Goodfellow, Bengio, Courville)', label: 'Chapter 6 — Deep Feedforward Networks', url: 'https://www.deeplearningbook.org/' }
    },
    {
      id: 'dl-q2', level: 'easy', category: 'Fundamentals', type: 'concept',
      q: 'Why do neural networks need a non-linear activation function?',
      answer: '<p>Without a non-linear activation, stacking any number of layers would still only be able to represent a <strong>linear</strong> function of the input — composing linear transformations just produces another linear transformation, no matter how many layers you add. Non-linear activations (ReLU, sigmoid, tanh, etc.) let the network approximate complex, non-linear relationships in data, which is what makes deep networks powerful in the first place.</p>',
      source: { site: 'PyTorch documentation', label: 'torch.nn — Non-linear Activations', url: 'https://pytorch.org/docs/stable/nn.html' }
    },
    {
      id: 'dl-q3', level: 'easy', category: 'Fundamentals', type: 'concept',
      q: 'What is the difference between a loss function and an optimizer?',
      answer: '<p>The <strong>loss function</strong> measures how wrong the network\'s current predictions are, producing a single scalar number (e.g. cross-entropy, MSE). The <strong>optimizer</strong> (SGD, Adam, RMSprop, etc.) is the algorithm that uses the loss\'s gradient with respect to the weights to decide how to update those weights so the loss goes down over training.</p><p>In short: the loss defines <em>what</em> "good" means; the optimizer defines <em>how</em> to get there.</p>',
      source: { site: 'Deep Learning (Goodfellow, Bengio, Courville)', label: 'Chapter 8 — Optimization for Training Deep Models', url: 'https://www.deeplearningbook.org/' }
    },
    {
      id: 'dl-q4', level: 'easy', category: 'Training', type: 'concept',
      q: 'What is the difference between an epoch and a batch?',
      answer: '<p>A <strong>batch</strong> is a subset of the training data processed together before one weight update is applied. An <strong>epoch</strong> is one complete pass through the <em>entire</em> training dataset — if you have 10,000 examples and a batch size of 100, one epoch consists of 100 batches (100 weight updates).</p><p>Training typically runs for many epochs, re-shuffling the data each time, until the loss on a held-out validation set stops improving.</p>',
      source: { site: 'PyTorch documentation', label: 'Training a classifier', url: 'https://pytorch.org/tutorials/' }
    },
    {
      id: 'dl-q5', level: 'easy', category: 'Fundamentals', type: 'concept',
      q: 'What is overfitting, and name two ways to reduce it.',
      answer: '<p><strong>Overfitting</strong> happens when a model learns the training data so closely — including its noise and idiosyncrasies — that it performs well on training data but poorly on unseen (validation/test) data. It is a sign the model has memorized rather than generalized.</p><p>Common fixes: <strong>dropout</strong> (randomly disabling neurons during training so the network can\'t rely on any single path), <strong>L2 regularization/weight decay</strong> (penalizing large weights), <strong>early stopping</strong> (halting training once validation loss stops improving), and <strong>data augmentation</strong> (artificially expanding the training set).</p>',
      source: { site: 'Deep Learning (Goodfellow, Bengio, Courville)', label: 'Chapter 7 — Regularization for Deep Learning', url: 'https://www.deeplearningbook.org/' }
    },
    {
      id: 'dl-q6', level: 'easy', category: 'CNN', type: 'concept',
      q: 'What is the purpose of a pooling layer in a CNN?',
      answer: '<p>A pooling layer (most commonly <strong>max pooling</strong>) downsamples a feature map, reducing its spatial dimensions and therefore the amount of computation needed in later layers. It also adds a degree of <strong>translation invariance</strong> — a detected feature slightly shifted in position still survives the pooling operation, since pooling just keeps the strongest activation in each small window regardless of its exact location within that window.</p>',
      source: { site: 'PyTorch documentation', label: 'torch.nn — Pooling layers', url: 'https://pytorch.org/docs/stable/nn.html' }
    },
    {
      id: 'dl-q7', level: 'easy', category: 'RNN', type: 'concept',
      q: 'What makes a Recurrent Neural Network different from a feedforward network?',
      answer: '<p>A feedforward network processes each input independently with no memory of prior inputs. An <strong>RNN</strong> maintains a <strong>hidden state</strong> that is updated at every time step and carried forward, letting the network\'s output at time <em>t</em> depend on everything it has seen in the sequence up to that point — not just the current input. This makes RNNs naturally suited to sequential data like text, audio, and time series.</p>',
      source: { site: 'Deep Learning (Goodfellow, Bengio, Courville)', label: 'Chapter 10 — Sequence Modeling: Recurrent and Recursive Nets', url: 'https://www.deeplearningbook.org/' }
    },
    // ===================== MEDIUM =====================
    {
      id: 'dl-q8', level: 'medium', category: 'Backpropagation', type: 'concept',
      q: 'Explain backpropagation in your own words — what problem does it solve and how?',
      answer: '<p>Backpropagation solves the problem of computing the gradient of the loss with respect to <em>every</em> weight in a multi-layer network, efficiently enough to be practical even with millions of parameters.</p><p>It works by first running a <strong>forward pass</strong> (computing the prediction and loss, caching intermediate values), then a <strong>backward pass</strong> that applies the calculus <strong>chain rule</strong> starting from the loss and moving backwards layer by layer. At each layer, the gradient already computed for the layer just downstream is reused to compute the gradients for the current layer\'s weights — avoiding the need to recompute shared sub-calculations from scratch for every single weight. The resulting gradients are then used by an optimizer (e.g. SGD, Adam) to update the weights.</p>',
      source: { site: 'Deep Learning (Goodfellow, Bengio, Courville)', label: 'Chapter 6.5 — Back-Propagation and Other Differentiation Algorithms', url: 'https://www.deeplearningbook.org/' }
    },
    {
      id: 'dl-q9', level: 'medium', category: 'Activations', type: 'concept',
      q: 'What is the "dying ReLU" problem, and how does Leaky ReLU address it?',
      answer: '<p>A ReLU neuron outputs <code>max(0, z)</code>. If a neuron\'s weighted input <code>z</code> is consistently negative across the training data (often due to a large negative gradient update), its output is permanently zero, and since ReLU\'s gradient is also zero for negative inputs, that neuron stops receiving any gradient signal — it "dies" and never updates again.</p><p><strong>Leaky ReLU</strong> fixes this by allowing a small, non-zero slope for negative inputs: <code>f(z) = z</code> if <code>z &gt; 0</code>, else <code>αz</code> for a small constant <code>α</code> (e.g. 0.01). This keeps a small gradient flowing even when the neuron\'s input is negative, so it can still recover and continue learning.</p>',
      source: { site: 'PyTorch documentation', label: 'torch.nn.LeakyReLU', url: 'https://pytorch.org/docs/stable/generated/torch.nn.LeakyReLU.html' }
    },
    {
      id: 'dl-q10', level: 'medium', category: 'Training', type: 'concept',
      q: 'Compare SGD, RMSprop, and Adam as optimizers.',
      answer: '<p><strong>SGD (Stochastic Gradient Descent)</strong> takes a step opposite the gradient scaled by a fixed learning rate, optionally with momentum to smooth out noisy updates. Simple and well understood, but sensitive to the learning rate and can converge slowly.</p><p><strong>RMSprop</strong> adapts the effective learning rate per parameter by dividing by a running average of recent squared gradients — parameters with consistently large gradients get smaller effective steps, and vice versa. This helps with noisy or non-stationary objectives.</p><p><strong>Adam</strong> combines momentum (a running average of the gradient itself) with RMSprop-style per-parameter scaling (a running average of squared gradients), giving fast, robust convergence with minimal tuning — it is the most common default optimizer in practice, though well-tuned SGD can sometimes generalize slightly better.</p>',
      source: { site: 'PyTorch documentation', label: 'torch.optim — Algorithms', url: 'https://pytorch.org/docs/stable/optim.html' }
    },
    {
      id: 'dl-q11', level: 'medium', category: 'CNN', type: 'concept',
      q: 'Why does weight sharing in convolutional layers reduce the number of parameters so dramatically compared to a fully connected layer?',
      answer: '<p>In a fully connected layer, every input pixel has its own independent weight to every output neuron — for a 224×224×3 image that is already hundreds of thousands of weights just for one small output layer. A convolutional layer instead learns one small filter (e.g. 3×3×channels) and <strong>slides it across the entire input</strong>, reusing the exact same weights at every spatial position. The result: the number of parameters in a conv layer depends only on the filter size and the number of filters, not on the size of the input image — the same 3×3 filter works whether the input is 32×32 or 1024×1024.</p>',
      source: { site: 'Deep Learning (Goodfellow, Bengio, Courville)', label: 'Chapter 9 — Convolutional Networks', url: 'https://www.deeplearningbook.org/' }
    },
    {
      id: 'dl-q12', level: 'medium', category: 'CNN', type: 'scenario',
      q: 'You have only 500 labeled images for a new image classification task. What is the most practical approach, and why?',
      answer: '<p>With so little data, training a CNN from scratch would almost certainly overfit badly. The practical approach is <strong>transfer learning</strong>: start from a CNN pre-trained on a large dataset (e.g. ImageNet), <strong>freeze</strong> its convolutional base (which already encodes general, broadly useful visual features — edges, textures, shapes), and train only a new, small classification head on top using your 500 images.</p><p>If accuracy still needs improvement and you have a little more data, you can <strong>fine-tune</strong> by unfreezing the later convolutional layers (which hold more task-specific features) and continuing training at a low learning rate, while keeping the earliest layers frozen.</p>',
      source: { site: 'PyTorch documentation', label: 'Transfer Learning for Computer Vision Tutorial', url: 'https://pytorch.org/tutorials/beginner/transfer_learning_tutorial.html' }
    },
    {
      id: 'dl-q13', level: 'medium', category: 'RNN', type: 'concept',
      q: 'What is backpropagation through time (BPTT)?',
      answer: '<p>BPTT is how an RNN is trained: the recurrent network is conceptually <strong>"unrolled"</strong> across every time step of the input sequence, turning it into an equivalent (very deep) feedforward computation graph where the same weights are reused at each step. Ordinary backpropagation is then run on this unrolled graph, computing gradients for the shared weights by summing their contribution across every time step.</p><p>Because the same weight matrix is multiplied repeatedly going backwards through many time steps, BPTT is exactly where the vanishing/exploding gradient problem in vanilla RNNs originates.</p>',
      source: { site: 'Deep Learning (Goodfellow, Bengio, Courville)', label: 'Chapter 10.2 — Recurrent Neural Networks', url: 'https://www.deeplearningbook.org/' }
    },
    {
      id: 'dl-q14', level: 'medium', category: 'RNN', type: 'concept',
      q: 'Walk through what the forget, input, and output gates do inside an LSTM cell.',
      answer: '<p>An LSTM cell maintains a <strong>cell state</strong> (long-term memory) alongside the usual hidden state, controlled by three learned gates, each a sigmoid-activated vector between 0 and 1 acting as a "how much to let through" dial:</p><ul><li><strong>Forget gate</strong> — decides how much of the existing cell state to discard, based on the current input and previous hidden state.</li><li><strong>Input gate</strong> — decides how much of a newly computed candidate value to add into the cell state.</li><li><strong>Output gate</strong> — decides how much of the (now updated) cell state to expose as the new hidden state/output.</li></ul><p>Because the cell state update is largely additive (gated addition/removal, not repeated multiplication by a weight matrix), gradients can flow backward through many time steps without vanishing as quickly as in a vanilla RNN.</p>',
      source: { site: 'PyTorch documentation', label: 'torch.nn.LSTM', url: 'https://pytorch.org/docs/stable/generated/torch.nn.LSTM.html' }
    },
    {
      id: 'dl-q15', level: 'medium', category: 'Transformers', type: 'concept',
      q: 'What problem does positional encoding solve in a Transformer?',
      answer: '<p>Self-attention computes relationships between tokens based purely on their content (via queries, keys, and values) — it has no inherent notion of the <em>order</em> tokens appear in, unlike an RNN which processes tokens strictly in sequence. Without any positional signal, "the cat chased the dog" and "the dog chased the cat" would look identical to a pure self-attention layer.</p><p><strong>Positional encoding</strong> adds a vector representing each token\'s position in the sequence to its embedding before the attention layers, giving the model the information it needs to distinguish order and relative position.</p>',
      source: { site: '"Attention Is All You Need" (Vaswani et al., 2017)', label: 'Section 3.5 — Positional Encoding', url: 'https://arxiv.org/abs/1706.03762' }
    },
    // ===================== HARD =====================
    {
      id: 'dl-q16', level: 'hard', category: 'Training', type: 'concept',
      q: 'Explain the vanishing and exploding gradient problems, and how batch normalization and residual connections help.',
      answer: '<p>During backpropagation through many layers (or many time steps in an RNN), gradients are repeatedly multiplied by weight matrices and activation derivatives. If these factors are consistently &lt;1 in magnitude, the gradient shrinks exponentially as it propagates backward — <strong>vanishing</strong>, so early layers receive almost no learning signal. If the factors are consistently &gt;1, the gradient grows exponentially — <strong>exploding</strong>, causing unstable, huge weight updates.</p><p><strong>Batch normalization</strong> normalizes each layer\'s inputs to have stable mean and variance during training, which keeps activations (and their gradients) in a well-behaved range and reduces sensitivity to initialization and learning rate. <strong>Residual (skip) connections</strong>, as used in ResNet and Transformers, let the gradient flow directly backward through an identity shortcut around a block of layers, bypassing the repeated multiplications that would otherwise shrink it — allowing networks to be trained with far more layers than was previously practical.</p>',
      source: { site: 'Deep Learning (Goodfellow, Bengio, Courville)', label: 'Chapter 8.7 — Batch Normalization; ResNet paper (He et al., 2015)', url: 'https://www.deeplearningbook.org/' }
    },
    {
      id: 'dl-q17', level: 'hard', category: 'Transformers', type: 'concept',
      q: 'Derive, at a high level, what the Query, Key, and Value matrices do in self-attention, and why the output is a weighted sum.',
      answer: '<p>For each token, self-attention computes three vectors by multiplying its embedding by three learned weight matrices: a <strong>Query (Q)</strong> ("what am I looking for"), a <strong>Key (K)</strong> ("what do I have to offer"), and a <strong>Value (V)</strong> ("the actual content I\'ll contribute if attended to").</p><p>For a given token\'s query, its compatibility with every other token\'s key is computed via a dot product (scaled by the square root of the key dimension for numerical stability), producing a raw attention score per token pair. A <strong>softmax</strong> over those scores turns them into weights that sum to 1. The token\'s new representation is then a <strong>weighted sum of all tokens\' Value vectors</strong>, using those softmax weights — tokens the query found highly compatible contribute more of their Value to the result. This is why attention output is literally a weighted average: it lets each token selectively aggregate information from the rest of the sequence in proportion to learned relevance.</p>',
      source: { site: '"Attention Is All You Need" (Vaswani et al., 2017)', label: 'Section 3.2 — Attention', url: 'https://arxiv.org/abs/1706.03762' }
    },
    {
      id: 'dl-q18', level: 'hard', category: 'CNN', type: 'scenario',
      q: 'A CNN performs well on training data but much worse on validation data, and the gap widens with more training. Diagnose and propose a plan.',
      answer: '<p>This is a textbook <strong>overfitting</strong> signature — the growing train/validation gap over time means the model is increasingly memorizing training-set-specific patterns (including noise) rather than learning generalizable features. A systematic plan: (1) check if the training set is simply too small relative to model capacity — if so, apply <strong>data augmentation</strong> (random crops, flips, color jitter) to effectively enlarge it; (2) add or increase <strong>regularization</strong> — dropout in the fully connected layers, L2 weight decay, or both; (3) use <strong>early stopping</strong> based on validation loss rather than training for a fixed number of epochs; (4) consider reducing model capacity (fewer filters/layers) if the dataset is genuinely small; (5) if a suitable pre-trained model exists, switch to <strong>transfer learning</strong> instead of training from scratch, since the pre-trained features already generalize well and need far less data to adapt.</p>',
      source: { site: 'Deep Learning (Goodfellow, Bengio, Courville)', label: 'Chapter 7 — Regularization for Deep Learning', url: 'https://www.deeplearningbook.org/' }
    },
    {
      id: 'dl-q19', level: 'hard', category: 'Reinforcement Learning', type: 'concept',
      q: 'How does deep reinforcement learning differ fundamentally from supervised deep learning in terms of the training signal it uses?',
      answer: '<p>Supervised deep learning trains on a fixed dataset of (input, correct-label) pairs — the "ground truth" for every example is known upfront, and the loss directly compares the prediction to that fixed label. <strong>Deep reinforcement learning</strong> has no such fixed labeled dataset: an <strong>agent</strong> takes actions in an <strong>environment</strong> and receives a <strong>reward</strong> signal that is often <strong>delayed</strong> (the consequences of an action may not be apparent until many steps later) and <strong>sparse</strong> (useful reward signal may be rare).</p><p>The network must learn a <strong>policy</strong> (or a value function estimating future reward) purely from this trial-and-error feedback loop, which introduces challenges supervised learning doesn\'t have: the exploration-vs-exploitation trade-off (try new actions vs. use what already works), credit assignment across delayed rewards, and training data that is generated by the agent\'s own evolving behavior rather than being static and i.i.d.</p>',
      source: { site: 'Deep Learning (Goodfellow, Bengio, Courville)', label: 'Chapter 1 — Introduction (RL contrast); Sutton & Barto, Reinforcement Learning: An Introduction', url: 'https://www.deeplearningbook.org/' }
    },
    {
      id: 'dl-q20', level: 'hard', category: 'Architecture Design', type: 'scenario',
      q: 'You need to choose between an LSTM-based model and a Transformer-based model for a long-document classification task with limited GPU memory. What trade-offs would you weigh?',
      answer: '<p><strong>Transformers</strong>\' self-attention computes relationships between every pair of tokens, so both its compute and memory scale <strong>quadratically</strong> with sequence length — for very long documents this can be prohibitive on limited GPU memory, often requiring truncation, chunking, or memory-efficient attention variants. In exchange, Transformers parallelize fully across the sequence during training (fast on GPUs for sequences that do fit) and tend to capture long-range dependencies more directly via attention.</p><p><strong>LSTMs</strong> scale <strong>linearly</strong> with sequence length and use comparatively little memory per step, making them more memory-friendly for very long sequences, but they process tokens sequentially (harder to parallelize, slower wall-clock training) and can still struggle somewhat with very long-range dependencies despite gating.</p><p>Practical trade-off for this scenario: if GPU memory is the binding constraint and documents are very long, an LSTM (or a Transformer variant with sparse/linear attention, or hierarchical chunking of the document fed through a Transformer) is often the more memory-practical choice; if documents can be reasonably truncated or chunked, a standard Transformer is usually preferred for its stronger long-range modeling and training speed.</p>',
      source: { site: 'PyTorch documentation', label: 'torch.nn.LSTM / torch.nn.Transformer', url: 'https://pytorch.org/docs/stable/nn.html' }
    }
  ]
};
