<?php
require_once 'includes/db.php';
require_once 'includes/helpers.php';

session_start();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name = trim($_POST['name'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $message = trim($_POST['message'] ?? '');

    $errors = [];
    if ($name === '') $errors[] = 'Please enter your name.';
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) $errors[] = 'Please enter a valid email.';
    if ($message === '') $errors[] = 'Please enter a message.';

    // Saved to the database so you can read it in Admin → Messages.
    // If you later set up real email sending on your hosting (many
    // shared hosts support PHP's mail() out of the box, unlike local
    // XAMPP), you could add a mail() call here too — but the database
    // save means messages are never lost even without that.
    if (empty($errors)) {
        $stmt = $pdo->prepare("INSERT INTO contact_messages (name, email, message) VALUES (?, ?, ?)");
        $stmt->execute([$name, $email, $message]);

        // Success — redirect to a fresh GET request. This is what stops
        // the browser's "Confirm Form Resubmission" prompt: the page you
        // land on and can safely refresh is a GET, not the POST itself.
        header('Location: contact.php?sent=1');
        exit;
    }

    // Validation failed — stash the errors and what was typed in the
    // session, then redirect too (same reason: never render a POST
    // result directly). The next GET request below picks these back up.
    $_SESSION['contact_errors'] = $errors;
    $_SESSION['contact_old'] = ['name' => $name, 'email' => $email, 'message' => $message];
    header('Location: contact.php');
    exit;
}

// Pull any flashed errors/old input from a failed submission (one-time
// use — clear them immediately so they don't linger on a later visit).
$errors = $_SESSION['contact_errors'] ?? [];
$old = $_SESSION['contact_old'] ?? ['name' => '', 'email' => '', 'message' => ''];
unset($_SESSION['contact_errors'], $_SESSION['contact_old']);

$sent = isset($_GET['sent']);

$page_title = 'Contact Us';
require_once 'includes/header.php';
?>


  <!-- =================================================
       HERO
  ================================================== -->

  <section class="contact-hero">

    <div class="container">

      <span class="contact-eyebrow">
        ETERNAL MENS
      </span>

      <h1>
        Let's Talk.
      </h1>

      <p>
        Have a question about a product, your order,
        shipping or anything else? We're here to help.
      </p>

    </div>

  </section>


  <!-- =================================================
       CONTACT CONTENT
  ================================================== -->

  <section class="section contact-main">

    <div class="container">

      <div class="contact-grid">


        <!-- =============================================
             CONTACT INFORMATION
        ============================================== -->

        <div class="contact-information">

          <span class="contact-label">
            GET IN TOUCH
          </span>

          <h2>
            We'd love to<br>
            hear from you.
          </h2>

          <p class="contact-description">
            Whether you're looking for more information
            about a product or need help with an existing
            order, reach out and our team will get back
            to you as soon as possible.
          </p>


          <!-- EMAIL -->

          <a
           href="https://mail.google.com/mail/?view=cm&fs=1&to=eternalmens7@gmail.com"
          target="_blank"
          rel="noopener noreferrer"
          class="contact-info-item"
          >

            <span class="contact-info-icon">
              @
            </span>

            <span>

              <small>
                EMAIL
              </small>

              <strong>
                eternalmens7@gmail.com
              </strong>

            </span>

          </a>

        

          <!-- PHONE -->

          <a
            href="tel:+923716740179"
            class="contact-info-item"
          >

            <span class="contact-info-icon">
              ☎
            </span>

            <span>

              <small>
                PHONE
              </small>

              <strong>
                +92 3716740179
              </strong>

            </span>

          </a>


          <!-- WHATSAPP -->

          <a
            href="https://wa.me/923716740179"
            target="_blank"
            rel="noopener"
            class="contact-info-item"
          >

            <span class="contact-info-icon">
              W
            </span>

            <span>

              <small>
                WHATSAPP
              </small>

              <strong>
                Chat With Us
              </strong>

            </span>

          </a>


          <!-- HOURS -->

          <div class="contact-info-item contact-hours">

            <span class="contact-info-icon">
              ◷
            </span>

            <span>

              <small>
                CUSTOMER SUPPORT
              </small>

              <strong>
                Monday — Saturday
              </strong>

              <em>
                12:00 AM — 8:00 PM
              </em>

            </span>

          </div>

        </div>
        

<section class="section" style="padding-top:2.5rem;">
    <div class="container" style="max-width:560px;">
        <p class="section-eyebrow">Get In Touch</p>
        <h1 class="section-heading">Contact Us</h1>

        <?php if ($sent): ?>
            <div style="background:#eaf4ee; border:1px solid var(--success); color:var(--success); padding:1.25rem; margin-bottom:1.5rem;">
                Thanks — we've received your message and will get back to you within 1–2 business days.
            </div>
        <?php endif; ?>

        <?php if (!empty($errors)): ?>
            <div style="background:#fbeaea; border:1px solid var(--danger); color:var(--danger); padding:1rem 1.25rem; margin-bottom:1.5rem; font-size:0.9rem;">
                <?php foreach ($errors as $e): ?><p><?php echo h($e); ?></p><?php endforeach; ?>
            </div>
        <?php endif; ?>

        <form method="POST" action="contact.php">
            <div class="form-group"><label>Name</label><input type="text" name="name" value="<?php echo h($old['name']); ?>" required></div>
            <div class="form-group"><label>Email</label><input type="email" name="email" value="<?php echo h($old['email']); ?>" required></div>
            <div class="form-group"><label>Message</label><textarea name="message" rows="5" required><?php echo h($old['message']); ?></textarea></div>
            <button type="submit" class="btn btn-primary btn-block">Send Message</button>
        </form>
        
    </div>
</section>
<?php require_once 'includes/footer.php'; ?>