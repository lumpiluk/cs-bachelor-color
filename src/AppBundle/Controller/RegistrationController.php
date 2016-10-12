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

        // get the login error if there is one
        $authenticationUtils = $this->get('security.authentication_utils');
        $error = $authenticationUtils->getLastAuthenticationError();

        // 2) handle the submit (will only happen on POST)
        $form->handleRequest($request);
        if ($form->isSubmitted() && $form->isValid()) {

            // Determine a random experimental group.
            $exp_groups = array('EXPERIMENT_GROUP_A', 'EXPERIMENT_GROUP_B');
            $random_role = $exp_groups[array_rand($exp_groups, 1)];
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
            }

            // 2.1) Determine a random password (key)
            $key = $this->random_str($length = 16);
            $user->setPlainPassword($key);

            // 3) Encode the password. If the user already exists, it will be overridden.
            $password = $this->get('security.password_encoder')
                ->encodePassword($user, $user->getPlainPassword());
            $user->setPassword($password);

            // Save the user.
            $save_user_exception = null;
            try {
                if (!$existing) {
                    $em->persist($user);
                } else {
                    $user = $em->merge($user);
                }
                $em->flush();
            } catch (Exception $e) {
                echo 'Caught exception: ',  $e->getMessage(), "\n";
            }

            // 5) Send mail.
            $message = \Swift_Message::newInstance()
                ->setSubject('GdC Color Exercise. Registration successful.')
                ->setFrom('info@lukas-stratmann.com')
                ->setTo('lumpiluk@gmail.com') // TODO: remove this line and use @mail.upb.de!
                //->setTo($user->get_email()) // TODO: use this line instead
                ->setReplyTo('lumpiluk@mail.upb.de')
                ->setBody(
                    $this->renderView('color/experiment/registration_mail.html.twig', array(
                        'key' => $key
                    )), 'text/html');
            $this->get('mailer')->send($message);

            return $this->render('color/experiment/register.html.twig', array(
                'registration_form' => $form->createView(),
                'registration_success' => !$save_user_exception,
                'new_experimental_group' => $random_role,
                'save_user_exception' => $save_user_exception
            ));
        }

        return $this->render('color/experiment/register.html.twig', array(
            'registration_form' => $form->createView(),
            'registration_success' => false,
            'new_experimental_group' => '[Not registered yet]',
            'save_user_exception' => null
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
}
