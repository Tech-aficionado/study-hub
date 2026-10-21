// Computer Vision interview questions — data for the shared renderer (../js/interview.js).
// Every answer is written here from scratch, grounded in standard computer vision
// references (OpenCV documentation, Szeliski's "Computer Vision: Algorithms and
// Applications", Hartley & Zisserman's "Multiple View Geometry"). Source fields cite
// these works/sites generically rather than deep-linking unverified page anchors.
window.STUDYHUB_INTERVIEW = {
  topic: 'computer-vision',
  questions: [
    // ===================== EASY =====================
    {
      id: 'cv-q1', level: 'easy', category: 'Camera Models', type: 'concept',
      q: 'What is the pinhole camera model and why is it the standard abstraction in computer vision?',
      answer: '<p>The <strong>pinhole camera model</strong> describes image formation as light from a 3D scene point travelling in a straight line through a single infinitesimal aperture and landing on an image plane behind it, producing an inverted projection. Mathematically, a point (X, Y, Z) projects to image coordinates <code>x = f·X/Z, y = f·Y/Z</code>, where f is the focal length (distance from pinhole to image plane).</p><p>It is the standard abstraction because real lens systems, for points near the optical axis, reduce to the same projective geometry — the lens just lets through more light than a literal pinhole could, without changing the underlying projection equations. This makes the pinhole model the shared mathematical foundation for camera calibration, stereo vision, and structure from motion alike.</p>',
      source: { site: 'OpenCV documentation', label: 'Camera Calibration and 3D Reconstruction', url: 'https://docs.opencv.org/4.x/d9/d0c/group__calib3d.html' }
    },
    {
      id: 'cv-q2', level: 'easy', category: 'Camera Models', type: 'concept',
      q: 'What is the difference between intrinsic and extrinsic camera parameters?',
      answer: '<p><strong>Intrinsic parameters</strong> describe the camera\'s own internal optical geometry, independent of where the camera is placed: focal length, principal point, pixel skew, and lens distortion coefficients, packed into the intrinsic calibration matrix K. They are fixed for a given camera/lens combination.</p><p><strong>Extrinsic parameters</strong> describe where the camera sits in the world — a rotation matrix R and translation vector t that map world coordinates into the camera\'s own coordinate frame. These change every time the camera moves, while intrinsics stay constant.</p><p>The full projection combines both: <code>x = K[R|t]X_world</code>.</p>',
      source: { site: "Szeliski's Computer Vision textbook", label: 'Computer Vision: Algorithms and Applications, Ch. 2', url: 'https://szeliski.org/Book/' }
    },
    {
      id: 'cv-q3', level: 'easy', category: 'Camera Models', type: 'concept',
      q: 'How does orthographic projection differ from perspective projection?',
      answer: '<p><strong>Perspective projection</strong> models rays converging at a single center of projection, so a point\'s image coordinates depend on its depth: <code>x = f·X/Z</code>. This causes farther objects to appear smaller (foreshortening) and parallel lines to converge toward a vanishing point — this is how real cameras and eyes behave.</p><p><strong>Orthographic projection</strong> assumes parallel projection rays (the center of projection is at infinity), so a point simply drops its depth: <code>x = X, y = Y</code>. There is no size change with distance. It is a useful simplification when depth variation in the scene is small relative to the viewing distance, such as aerial imagery or normalized object views.</p>',
      source: { site: "Szeliski's Computer Vision textbook", label: 'Computer Vision: Algorithms and Applications, Ch. 2', url: 'https://szeliski.org/Book/' }
    },
    {
      id: 'cv-q4', level: 'easy', category: 'Feature Detection', type: 'concept',
      q: 'What makes a corner more useful than a plain edge for matching between images?',
      answer: '<p>An edge is distinctive only along the direction perpendicular to it — sliding along the edge itself produces a nearly identical local signal, so an edge point cannot be precisely and uniquely localized by itself (the "aperture problem" at that scale). A <strong>corner</strong>, where two edges meet, changes distinctly in every direction, which makes it uniquely localizable and far more reliable to re-detect and match across different images or viewpoints.</p><p>This is why detectors like Harris explicitly look for points where image intensity changes significantly in <em>all</em> directions, not just one.</p>',
      source: { site: 'OpenCV documentation', label: 'Harris Corner Detection', url: 'https://docs.opencv.org/4.x/dc/d0d/tutorial_py_features_harris.html' }
    },
    {
      id: 'cv-q5', level: 'easy', category: 'Feature Detection', type: 'concept',
      q: 'Name three classic edge detection operators and briefly distinguish them.',
      answer: '<ul><li><strong>Sobel</strong> — a simple first-derivative (gradient) operator using 3×3 kernels that weight the center row/column more heavily; good basic noise suppression, computationally cheap.</li><li><strong>Laplacian (often combined with Gaussian smoothing, "LoG")</strong> — a second-derivative operator; edges are found at zero-crossings. More noise-sensitive than gradient methods, so it is almost always paired with a prior blur.</li><li><strong>Canny</strong> — a full multi-stage pipeline (Gaussian smoothing → Sobel gradient → non-maximum suppression → hysteresis double-thresholding) that produces thin, well-localized, connected edges with few false positives. It is the de facto standard for general-purpose edge detection.</li></ul>',
      source: { site: 'OpenCV documentation', label: 'Canny Edge Detection', url: 'https://docs.opencv.org/4.x/da/d22/tutorial_py_canny.html' }
    },
    {
      id: 'cv-q6', level: 'easy', category: 'Stereo Vision', type: 'concept',
      q: 'What is the epipolar constraint and why does it matter for stereo matching?',
      answer: '<p>The <strong>epipolar constraint</strong> states that for a point observed in one stereo image, its corresponding point in the other image is not located anywhere in the full 2D frame — it is restricted to lie along a specific 1D line, the <strong>epipolar line</strong>, determined by the stereo rig\'s geometry (encoded in the essential or fundamental matrix).</p><p>This matters enormously in practice: it collapses what would otherwise be an expensive 2D search for a matching point into a cheap 1D search along a line, and after rectification that line becomes a simple horizontal scanline — the basis of efficient stereo matching algorithms.</p>',
      source: { site: 'OpenCV documentation', label: 'Epipolar Geometry', url: 'https://docs.opencv.org/4.x/da/de9/tutorial_py_epipolar_geometry.html' }
    },
    {
      id: 'cv-q7', level: 'easy', category: 'Stereo Vision', type: 'concept',
      q: 'What is disparity in stereo vision, and how does it relate to depth?',
      answer: '<p><strong>Disparity</strong> is the difference in horizontal image position of the same 3D point as seen in the left versus right image of a rectified stereo pair. It is inversely related to depth: nearby points shift a large amount between the two views (large disparity), while distant points shift very little (small disparity), following <code>depth = (baseline · focal length) / disparity</code>. This is why stereo matching — the process of finding corresponding pixels in both images to compute disparity — is the core step in recovering a depth map from a stereo pair.</p>',
      source: { site: "Szeliski's Computer Vision textbook", label: 'Computer Vision: Algorithms and Applications, Ch. 12', url: 'https://szeliski.org/Book/' }
    },
    {
      id: 'cv-q8', level: 'easy', category: 'Shape from Shading', type: 'concept',
      q: 'What is the Lambertian reflectance model and when is it a reasonable assumption?',
      answer: '<p>The <strong>Lambertian model</strong> assumes a surface scatters incoming light equally in every outgoing direction, so the observed brightness depends only on the angle between the surface normal N and the light direction L: <code>I = ρ·(N·L)</code>, where ρ is the surface albedo. Crucially, brightness under this model does NOT depend on the viewing direction.</p><p>It is a reasonable assumption for matte, non-glossy surfaces — chalk, unfinished wood, matte paint, paper — and is the standard simplifying assumption behind most shape-from-shading and photometric stereo algorithms, even though most real materials also have some specular component.</p>',
      source: { site: "Szeliski's Computer Vision textbook", label: 'Computer Vision: Algorithms and Applications, Ch. 2.2', url: 'https://szeliski.org/Book/' }
    },
    {
      id: 'cv-q9', level: 'easy', category: 'Structure from Motion', type: 'concept',
      q: 'In one sentence, what does structure from motion (SfM) recover, and from what input?',
      answer: '<p>Structure from motion recovers both the <strong>3D positions of scene points</strong> (structure) and <strong>each camera\'s pose</strong> at the moment it captured each frame (motion), jointly, from a set of 2D image correspondences tracked across a sequence of images of the same static scene — typically with no prior camera calibration available.</p>',
      source: { site: "Szeliski's Computer Vision textbook", label: 'Computer Vision: Algorithms and Applications, Ch. 11', url: 'https://szeliski.org/Book/' }
    },
    {
      id: 'cv-q10', level: 'easy', category: 'Feature Detection', type: 'concept',
      q: 'Why do SIFT descriptors remain effective under scale and rotation changes?',
      answer: '<p>SIFT keypoints are first detected as extrema across a <strong>Difference-of-Gaussians scale-space pyramid</strong>, which means a keypoint survives being detected regardless of which scale it naturally stands out at — giving scale invariance by construction. Each keypoint is then assigned a <strong>dominant local gradient orientation</strong>, and the final 128-D descriptor is built relative to that orientation rather than to the image\'s fixed axes, giving rotation invariance: rotating the whole image rotates the assigned orientation by the same amount, so the descriptor itself stays unchanged.</p>',
      source: { site: 'OpenCV documentation', label: 'Introduction to SIFT', url: 'https://docs.opencv.org/4.x/da/df5/tutorial_py_sift_intro.html' }
    },

    // ===================== MEDIUM =====================
    {
      id: 'cv-q11', level: 'medium', category: 'Camera Models', type: 'concept',
      q: 'Explain the difference between linear and non-linear camera calibration methods.',
      answer: '<p><strong>Linear methods</strong> (e.g. the Direct Linear Transform) rearrange the projection equation into a homogeneous linear system from a set of known 3D–2D point correspondences and solve it in closed form, typically via SVD. They are fast and non-iterative, but cannot model lens distortion and do not minimize a geometrically meaningful error, making them sensitive to noise.</p><p><strong>Non-linear methods</strong> take that linear solution as an initial guess, then refine all parameters — including non-linear radial/tangential lens distortion — by minimizing the actual <strong>reprojection error</strong> (the pixel distance between observed and reprojected points) using an iterative optimizer such as Levenberg–Marquardt. Zhang\'s calibration method (used by OpenCV\'s <code>calibrateCamera</code>) combines both: a fast linear initialization followed by non-linear refinement for accuracy.</p>',
      source: { site: "Szeliski's Computer Vision textbook", label: 'Computer Vision: Algorithms and Applications, Ch. 11', url: 'https://szeliski.org/Book/' }
    },
    {
      id: 'cv-q12', level: 'medium', category: 'Feature Detection', type: 'coding',
      q: 'Walk through the steps of the RANSAC algorithm for robustly fitting a model like a homography.',
      answer: '<ol><li>Randomly sample the minimum number of correspondences required to define the model (4 point pairs for a homography).</li><li>Fit the model exactly to that minimal sample.</li><li>Test every remaining correspondence against the fitted model; count how many fall within a distance threshold — these are the <strong>inliers</strong>, and their count is the model\'s consensus score.</li><li>Repeat steps 1–3 for a fixed number of random trials (or until a success-probability criterion is met), and keep the model with the largest inlier count.</li><li>Optionally refit the final model using all its inliers with least squares, to get the most accurate final estimate.</li></ol><p>The key statistical insight: a model fit from a sample contaminated with outliers is essentially never agreed with by other random outliers, while a model fit from true inliers naturally gains support from the other true inliers — so enough random trials reliably surface the correct model as the one with maximum consensus.</p>',
      source: { site: 'OpenCV documentation', label: 'Feature Matching + Homography', url: 'https://docs.opencv.org/4.x/d1/de0/tutorial_py_feature_homography.html' }
    },
    {
      id: 'cv-q13', level: 'medium', category: 'Feature Detection', type: 'concept',
      q: 'How does the Hough Transform detect lines that are partially occluded or have gaps?',
      answer: '<p>The Hough Transform works by having every edge pixel "vote" in a parameter space rather than matching shapes directly in image space. For lines parameterized as <code>ρ = x·cosθ + y·sinθ</code>, each edge point traces a sinusoidal curve across all possible (ρ, θ); points that genuinely lie on the same straight line in the image cause their curves to intersect at the same (ρ, θ) accumulator cell, which builds up votes.</p><p>Because detection is based on <em>accumulated votes</em> rather than requiring every pixel of the line to be contiguous, a line with gaps or partial occlusion still produces a strong peak at its (ρ, θ) cell from whatever visible segments remain — the missing parts simply contribute no votes, but don\'t prevent the peak from forming.</p>',
      source: { site: 'OpenCV documentation', label: 'Hough Line Transform', url: 'https://docs.opencv.org/4.x/d6/d10/tutorial_py_houghlines.html' }
    },
    {
      id: 'cv-q14', level: 'medium', category: 'Stereo Vision', type: 'concept',
      q: 'Compare the essential matrix and the fundamental matrix.',
      answer: '<p>Both encode the epipolar geometry between two camera views, but differ in coordinate system and calibration dependence:</p><ul><li><strong>Essential matrix (E)</strong> relates corresponding points in <em>normalized, calibrated</em> camera coordinates (<code>p\'ᵗEp = 0</code>), and encodes only the relative rotation and translation between the cameras (5 degrees of freedom). It requires known camera intrinsics to compute.</li><li><strong>Fundamental matrix (F)</strong> relates corresponding points directly in <em>raw pixel</em> coordinates (<code>p\'ᵗFp = 0</code>), absorbing both cameras\' intrinsics as well as the extrinsic relationship. It can be estimated purely from pixel correspondences with the 8-point algorithm, with no calibration required.</li></ul><p>They relate via <code>F = K\'⁻ᵗ E K⁻¹</code>. In practice F is the more immediately useful matrix for uncalibrated image pairs; E is needed when you want to recover a metrically meaningful relative pose.</p>',
      source: { site: 'OpenCV documentation', label: 'Epipolar Geometry', url: 'https://docs.opencv.org/4.x/da/de9/tutorial_py_epipolar_geometry.html' }
    },
    {
      id: 'cv-q15', level: 'hard', category: 'Stereo Vision', type: 'scenario',
      q: 'Your local stereo matching algorithm produces noisy disparity in a large textureless wall region. Why, and what class of method helps?',
      answer: '<p>Local (correlation-based) stereo matching compares a small window around each pixel against candidate windows along the scanline using similarity measures like sum-of-squared-differences or normalized cross-correlation. In a textureless region, many different candidate disparities produce nearly identical (uniformly flat) window content, so the similarity score cannot meaningfully discriminate the correct disparity from wrong ones — the match is ambiguous by construction, producing noise.</p><p><strong>Global methods</strong> help here: by minimizing an energy function with both a data term and a <em>smoothness</em> term over the whole image (e.g. via graph cuts or dynamic programming), a textureless pixel\'s disparity gets pulled toward agreement with its well-matched neighbors instead of being decided in isolation.</p>',
      source: { site: "Szeliski's Computer Vision textbook", label: 'Computer Vision: Algorithms and Applications, Ch. 12', url: 'https://szeliski.org/Book/' }
    },
    {
      id: 'cv-q16', level: 'medium', category: 'Shape from Shading', type: 'concept',
      q: 'Why does photometric stereo need at least three images with different, known light directions?',
      answer: '<p>Under the Lambertian model, a single image gives one brightness equation per pixel, <code>I = ρ·(N·L)</code>, but the surface normal N has 3 unknown components (constrained to unit length, leaving 2 true degrees of freedom) and the albedo ρ is also unknown — more unknowns than one equation can resolve.</p><p>Taking multiple images of the <em>same static scene from the same viewpoint</em>, each lit from a different known direction L<sub>k</sub>, gives one linear equation per image: <code>I<sub>k</sub> = ρ·(N·L<sub>k</sub>)</code>. With three or more non-coplanar light directions, the system becomes fully determined and can be solved directly (e.g. by least squares) for both N and ρ at every pixel — turning an ill-posed single-image problem into a simple, well-posed linear one.</p>',
      source: { site: "Szeliski's Computer Vision textbook", label: 'Computer Vision: Algorithms and Applications, Ch. 2.2 / 13', url: 'https://szeliski.org/Book/' }
    },
    {
      id: 'cv-q17', level: 'hard', category: 'Shape from Shading', type: 'concept',
      q: 'How is inter-reflection a problem for shape-from-shading in concave scenes?',
      answer: '<p>Basic shading models assume a surface point is lit only by direct light from the source. In concave real scenes (e.g. a corner, the inside of a bowl), surface points also receive <strong>indirect light bounced off nearby surfaces</strong> — inter-reflection. This extra illumination makes concave regions appear brighter than a direct-lighting-only model predicts.</p><p>Since brighter-than-expected brightness is normally interpreted (via the reflectance equation) as a surface normal pointing more toward the light, naive algorithms systematically <strong>underestimate concavity</strong> — recovered depth in corners comes out shallower than reality. Correcting for this requires modeling the mutual illumination between surface patches (similar to radiosity in rendering), which most simple shape-recovery pipelines avoid by assuming convex scenes instead.</p>',
      source: { site: "Szeliski's Computer Vision textbook", label: 'Computer Vision: Algorithms and Applications, Ch. 2.2', url: 'https://szeliski.org/Book/' }
    },
    {
      id: 'cv-q18', level: 'medium', category: 'Structure from Motion', type: 'concept',
      q: 'What is camera self-calibration, and why is it useful for structure from motion?',
      answer: '<p><strong>Self-calibration</strong> recovers a camera\'s intrinsic parameters directly from a sequence of images of an unknown, uncalibrated scene — without ever photographing a known calibration object. It exploits algebraic constraints that must hold consistently across many views of a rigid scene captured by the same camera (such as relationships derived from the fundamental matrices of several view pairs).</p><p>This matters because most real-world image sequences — archival footage, casual photo collections, drone video — were never captured with a calibration pattern in frame. Self-calibration lets a full structure-from-motion pipeline run on that kind of footage anyway, recovering both 3D structure and camera motion purely from the images themselves.</p>',
      source: { site: "Szeliski's Computer Vision textbook", label: 'Computer Vision: Algorithms and Applications, Ch. 11', url: 'https://szeliski.org/Book/' }
    },
    {
      id: 'cv-q19', level: 'medium', category: 'Structure from Motion', type: 'concept',
      q: 'Why is an SfM reconstruction without camera calibration only determined "up to scale" (or up to a projective transform)?',
      answer: '<p>Without known camera intrinsics, a set of 2D point correspondences across images can be explained equally well by infinitely many different 3D reconstructions related by an arbitrary projective transformation — the data alone cannot distinguish between them, a classic case of an under-constrained inverse problem. This is the <strong>projective ambiguity</strong>.</p><p>Recovering a true <strong>Euclidean</strong> reconstruction (correct angles, parallelism, and a meaningful metric scale) requires either known or self-calibrated intrinsics, or an additional external metric reference (e.g. one known real-world distance in the scene) to anchor the scale — this is called the "Euclidean upgrade" of a projective reconstruction.</p>',
      source: { site: 'OpenCV documentation', label: 'Camera Calibration and 3D Reconstruction', url: 'https://docs.opencv.org/4.x/d9/d0c/group__calib3d.html' }
    },
    {
      id: 'cv-q20', level: 'hard', category: 'Structure from Motion', type: 'concept',
      q: 'What role does bundle adjustment play in a structure-from-motion pipeline, and why is it needed even after incremental reconstruction?',
      answer: '<p><strong>Bundle adjustment</strong> is a joint, non-linear least-squares optimization that simultaneously refines <em>every</em> camera pose and <em>every</em> reconstructed 3D point together, by minimizing the total reprojection error summed across all observations in all images.</p><p>It is needed because an incremental SfM pipeline — registering one new image at a time via Perspective-n-Point and triangulating new points as it goes — accumulates small errors at every step; by the time dozens or hundreds of images have been added, this drift can noticeably warp the reconstruction (a phenomenon similar to loop-closure error in SLAM). Bundle adjustment corrects this by re-optimizing the whole system jointly against the full set of observations rather than the locally greedy estimates made along the way, which is why it is run periodically during incremental reconstruction and always as a final global refinement step.</p>',
      source: { site: "Szeliski's Computer Vision textbook", label: 'Computer Vision: Algorithms and Applications, Ch. 11', url: 'https://szeliski.org/Book/' }
    }
  ]
};
