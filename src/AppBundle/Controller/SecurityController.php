<?php
/**
 * Built with help from http://symfony.com/doc/current/security/form_login_setup.html
 *
 * Created by PhpStorm.
 * User: lumpiluk
 * Date: 10/12/16
 * Time: 5:34 PM
 */

namespace AppBundle\Controller;


use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use AppBundle\Entity\User;
use AppBundle\Form\UserType;

class SecurityController extends Controller
{
    /**
     * @Route("/login", name="login")
     * @param Request $request
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function loginAction(Request $request)
    {
        $authenticationUtils = $this->get('security.authentication_utils');

        // get the login error if there is one
        $error = $authenticationUtils->getLastAuthenticationError();

        // last username entered by the user
        $lastUsername = $authenticationUtils->getLastUsername();

        return $this->render('color/experiment/login.html.twig', array(
            'login_last_username' => $lastUsername,
            'login_error'         => $error
        ));
    }
}