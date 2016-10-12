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
     * @Route("/", name="homepage")
     */
    public function homeAction()
    {
        return $this->render('color/home.html.twig');
    }

    /**
     * @Route("/color-systems/{color_system_name}", name="color_system_page")
     * @param $color_system_name
     * @return Response
     */
    public function colorSystemAction($color_system_name)
    {
        return $this->render('color/color_systems/'.$color_system_name.'_color_system.html.twig');
    }

    /**
     * @Route("/exercises/{exercise_name}", name="exercise")
     * @param $exercise_name
     * @return Response
     */
    public function exerciseAction($exercise_name) {
        return $this->render('color/exercises/'.$exercise_name.'.html.twig');
    }
}
