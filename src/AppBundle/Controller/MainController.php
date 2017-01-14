<?php
/**
 * Created by PhpStorm.
 * User: lumpiluk
 * Date: 10/10/16
 * Time: 7:40 PM
 */

namespace AppBundle\Controller;

use AppBundle\Entity\User;
use Exception;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;


class MainController extends Controller
{
    /**
     * @Route("/", name="homepage")
     * @return Response
     */
    public function homeAction()
    {
        return $this->render('color/home.html.twig');
    }

    /**
     * @Route("/about.html", name="about")
     * @return Response
     */
    public function aboutAction()
    {
        return $this->render('color/about.html.twig');
    }

    /**
     * @Route("/color-systems.html", name="color_systems_general")
     * @return Response
     */
    public function colorSystemsGeneralAction()
    {
        return $this->render('color/color_systems.html.twig');
    }

    /**
     * @Route("/color-systems/{color_system_name}.html", name="color_system_page")
     * @param $color_system_name
     * @return Response
     */
    public function colorSystemAction($color_system_name)
    {
        return $this->render('color/color_systems/'.$color_system_name.'_color_system.html.twig');
    }

    /**
     * @Route("/exercises.html", name="exercises_general")
     * @return Response
     */
    public function exercisesGeneralAction()
    {
        return $this->render('color/exercises/exercises_page.html.twig');
    }

    /**
     * @Route("/exercises/{exercise_name}.html", name="exercise")
     * @param Request $request
     * @param $exercise_name
     * @return Response
     */
    public function exerciseAction(Request $request, $exercise_name) {
        return $this->render('color/exercises/'.$exercise_name.'.html.twig', array(
            'color_systems' => $request->get('color_systems'),
            'all_available_ex' => $request->get('all_available_ex') // Only relevant for the experiment to log completed exercises.
        ));
    }

    /**
     * Set the user flags for the respective exercises to true.
     * This indicates that an exercise has been completed.
     * This function should be called via AJAX once a user has completed an exercise.
     * @Route("/exercise-complete/{exercise_name}", name="exercise-complete")
     * @param Request $request
     * @param $exercise_name
     * @return Response
     */
    public function exerciseCompleteAction(Request $request, $exercise_name) {
        $user = $this->getUser();
        $error_msg = null;
        if (!($user instanceof User)) {
            return $this->render('color/ajax_responses/exercise_complete.html.twig', array(
                'success' => false,
                'user_valid' => false,
                'error_msg' => null
            ));
        }
        switch ($exercise_name) {
            case "conversion":
                $user->setExerciseConversionComplete(true);
                break;
            case "conversion_selection":
                $user->setExerciseConversionSelectionComplete(true);
                break;
            case "matching":
                $user->setExerciseMatchingComplete(true);
                break;
            case "selection":
                $user->setExerciseSelectionComplete(true);
                break;
        }
        try {
            $em = $this->getDoctrine()->getManager();
            $user = $em->merge($user);
            $em->flush();
        } catch (Exception $e) {
            $error_msg = $e->getMessage();
        }

        return $this->render('color/ajax_responses/exercise_complete.html.twig', array(
            'success' => !$error_msg,
            'user_valid' => true,
            'error_msg' => $error_msg
        ));
    }
}
