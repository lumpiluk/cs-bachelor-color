<?php
/**
 * Adapted from http://symfony.com/doc/current/doctrine/registration_form.html
 *
 * Created by PhpStorm.
 * User: lumpiluk
 * Date: 10/12/16
 * Time: 6:42 PM
 */

namespace AppBundle\Controller;

use AppBundle\Form\UserType;
use AppBundle\Entity\User;
use Exception;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;

class RegistrationController extends Controller
{
    /**
     * @Route("/register", name="user_registration")
     * @param Request $request
     * @return \Symfony\Component\HttpFoundation\RedirectResponse|\Symfony\Component\HttpFoundation\Response
     */
    public function registerAction(Request $request)
    {
        // 1) build the form
        $user = new User();
        $form = $this->createForm(UserType::class, $user);

        // 2) handle the submit (will only happen on POST)
        $form->handleRequest($request);
        if ($form->isSubmitted() && $form->isValid()) {

            $save_user_exception = null;

            // Determine a random experimental group.
            $exp_groups = array('ROLE_EXPERIMENT_GROUP_A', 'ROLE_EXPERIMENT_GROUP_B');
            $random_role = $exp_groups[array_rand($exp_groups, 1)];

            $username_blocked = $this->is_username_blocked($user);
            if (!$username_blocked) {

                $user->setRoles(array(
                    'ROLE_USER',
                    $random_role
                ));

                // If they already exist, get that user.
                $em = $this->getDoctrine()->getManager();
                $existing = $em->getRepository('AppBundle\Entity\User')
                    ->findOneBy(array('username' => $user->getUsername()));
                if ($existing) {
                    $user = $existing;
                } else {
                    $user->setExerciseSelectionComplete(false);
                    $user->setExerciseMatchingComplete(false);
                    $user->setExerciseConversionSelectionComplete(false);
                    $user->setExerciseConversionComplete(false);
                }

                // Determine a random password (key)
                $key = $this->random_str($length = 16);
                $user->setPlainPassword($key);
                // Encode the password. If the user already exists, it will be overridden.
                $password = $this->get('security.password_encoder')
                    ->encodePassword($user, $user->getPlainPassword());
                $user->setPassword($password);

                // Determine a random survey key if the user does not yet exist.
                if (!$existing) {
                    $user->setSurveyKey($this->random_str(8));
                }

                // Save the user.
                try {
                    if (!$existing) {
                        $em->persist($user);
                    } else {
                        $user = $em->merge($user);
                    }
                    $em->flush();

                    // 5) Send mail.
                    $message = \Swift_Message::newInstance()
                        ->setSubject('GdC Color Exercise. Registration successful.')
                        ->setFrom('info@lukas-stratmann.com')
                        //->setTo('lumpiluk@gmail.com')// TODO: remove this line and use @mail.upb.de!
                        ->setTo($user->get_email()) // TODO: use this line instead
                        ->setReplyTo('lumpiluk@mail.upb.de')
                        ->setBody(
                            $this->renderView('color/experiment/registration_mail.html.twig', array(
                                'key' => $key
                            )), 'text/html');
                    $this->get('mailer')->send($message);

                } catch (Exception $e) {
                    $save_user_exception = $e->getMessage();
                }
            }

            return $this->render('color/experiment/register.html.twig', array(
                'registration_form' => $form->createView(),
                'registration_success' => !$save_user_exception && !$username_blocked,
                'new_experimental_group' => $random_role,
                'save_user_exception' => $save_user_exception,
                'username_blocked' => $username_blocked
            ));
        }

        return $this->render('color/experiment/register.html.twig', array(
            'registration_form' => $form->createView(),
            'registration_success' => false,
            'new_experimental_group' => '[Not registered yet]',
            'save_user_exception' => null,
            'username_blocked' => false
        ));
    }

    /**
     * From http://stackoverflow.com/questions/4356289/php-random-string-generator/31107425#31107425
     *
     * Generate a random string, using a cryptographically secure
     * pseudorandom number generator (random_int)
     *
     * For PHP 7, random_int is a PHP core function
     * For PHP 5.x, depends on https://github.com/paragonie/random_compat
     *
     * @param int $length      How many characters do we want?
     * @param string $keyspace A string of all possible characters
     *                         to select from
     * @return string
     */
    private function random_str($length, $keyspace = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ')
    {
        $str = '';
        $max = mb_strlen($keyspace, '8bit') - 1;
        for ($i = 0; $i < $length; ++$i) {
            $str .= $keyspace[random_int(0, $max)];
        }
        return $str;
    }

    /**
     * If the file app/Resources/students.txt exists and contains an email address
     * of the form username[at]someurl.com, this function will return false for that username,
     * true otherwise. If the file does not exist, nobody will be blocked.
     * @param User $user
     * @return bool
     */
    private function is_username_blocked(User $user) {
        try {
            // TODO: move line inside here
        } catch (Exception $e) {
            return false; // File does not exist. => Block nobody.
        }
        $root = $this->get('kernel')->getRootDir();
        $file = fopen($root.'/Resources/students.txt', 'r');

        while (!feof($file)) {
            $line = fgets($file);
            $pattern = '/^'.$user->getUsername().'@/';
            if (preg_match($pattern, $line) == 1) {
                return false; // Username in file. => Don't block.
            }
        }
        return true; // Username not in file.
    }
}
