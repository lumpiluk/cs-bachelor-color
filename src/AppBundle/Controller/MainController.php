<?php
/**
 * Created by PhpStorm.
 * User: lumpiluk
 * Date: 10/10/16
 * Time: 7:40 PM
 */

namespace AppBundle\Controller;

use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Response;


class MainController extends Controller
{
    /**
     * @Route("/")
     */
    public function showAction()
    {
        return $this->render('color/home.html.twig');
    }
}
